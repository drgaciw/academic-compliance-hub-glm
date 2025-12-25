#!/usr/bin/env bash

# Rollback Script for AAH Platform
#
# Usage:
#   ./scripts/rollback.sh [environment] [target]
#
# Examples:
#   ./scripts/rollback.sh production                    # Rollback to previous deployment
#   ./scripts/rollback.sh production latest              # Same as above
#   ./scripts/rollback.sh production <deployment-id>     # Rollback to specific deployment
#   ./scripts/rollback.sh staging                      # Rollback staging
#
# Options:
#   environment: production | staging | preview (default: production)
#   target: latest | <deployment-id> (default: latest)

set -e

# Configuration
ENVIRONMENT="${1:-production}"
TARGET="${2:-latest}"
TIMESTAMP=$(date -u +"%Y-%m-%d %H:%M:%S UTC")
LOG_FILE="rollback-$(date +%Y%m%d-%H%M%S).log"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
log() {
    echo "[$TIMESTAMP] $1" | tee -a "$LOG_FILE"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1" | tee -a "$LOG_FILE"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1" | tee -a "$LOG_FILE"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1" | tee -a "$LOG_FILE"
}

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1" | tee -a "$LOG_FILE"
}

check_prerequisites() {
    log "Checking prerequisites..."
    
    # Check for Vercel CLI
    if ! command -v vercel &> /dev/null; then
        log_error "Vercel CLI not found. Install with: npm i -g vercel"
        exit 1
    fi
    
    # Check if logged in
    if ! vercel whoami &> /dev/null; then
        log_error "Not logged in to Vercel. Run: vercel login"
        exit 1
    fi
    
    log_success "Prerequisites check passed"
}

get_deployment_list() {
    log "Fetching deployment history for $ENVIRONMENT..."
    
    if [ "$ENVIRONMENT" == "production" ]; then
        vercel ls --prod | head -20
    else
        vercel ls | head -20
    fi
}

identify_target_deployment() {
    log "Identifying target deployment..."
    
    if [ "$TARGET" == "latest" ]; then
        log_info "Target: Latest successful deployment"
        # Get the second-to-last deployment (most recent is current)
        DEPLOYMENT_URL=$(vercel ls --${[ "$ENVIRONMENT" == "production" ] && echo "prod" || echo ""} | tail -n +2 | head -1 | awk '{print $1}')
        
        if [ -z "$DEPLOYMENT_URL" ]; then
            log_error "Could not find a previous deployment"
            exit 1
        fi
    else
        log_info "Target: Specific deployment ID: $TARGET"
        DEPLOYMENT_URL="$TARGET"
    fi
    
    log_success "Target deployment: $DEPLOYMENT_URL"
}

confirm_rollback() {
    echo ""
    echo -e "${YELLOW}============================================${NC}"
    echo -e "${YELLOW}ROLLBACK CONFIRMATION${NC}"
    echo -e "${YELLOW}============================================${NC}"
    echo ""
    echo "Environment: $ENVIRONMENT"
    echo "Target: $DEPLOYMENT_URL"
    echo "Timestamp: $TIMESTAMP"
    echo ""
    echo -e "${RED}This will rollback the deployment!${NC}"
    echo ""
    read -p "Are you sure you want to proceed? (yes/no): " confirmation
    
    if [ "$confirmation" != "yes" ]; then
        log_warning "Rollback cancelled by user"
        exit 0
    fi
}

rollback_main_app() {
    log "Rolling back main app..."
    
    cd apps/main || exit 1
    
    if [ "$ENVIRONMENT" == "production" ]; then
        if [ "$TARGET" == "latest" ]; then
            vercel rollback --prod
        else
            vercel rollback "$DEPLOYMENT_URL" --prod
        fi
    else
        vercel rollback "$DEPLOYMENT_URL"
    fi
    
    cd - > /dev/null
    log_success "Main app rolled back"
}

rollback_student_app() {
    log "Rolling back student app..."
    
    cd apps/student || exit 1
    
    if [ "$ENVIRONMENT" == "production" ]; then
        vercel rollback --prod
    else
        vercel rollback "$DEPLOYMENT_URL"
    fi
    
    cd - > /dev/null
    log_success "Student app rolled back"
}

rollback_admin_app() {
    log "Rolling back admin app..."
    
    cd apps/admin || exit 1
    
    if [ "$ENVIRONMENT" == "production" ]; then
        vercel rollback --prod
    else
        vercel rollback "$DEPLOYMENT_URL"
    fi
    
    cd - > /dev/null
    log_success "Admin app rolled back"
}

verify_rollback() {
    log "Verifying rollback..."
    
    # Wait for deployments to complete
    log_info "Waiting for deployments to complete..."
    sleep 10
    
    # Check deployment status
    log_info "Checking deployment status..."
    
    if [ "$ENVIRONMENT" == "production" ]; then
        MAIN_URL=$(vercel ls --prod | head -2 | tail -1 | awk '{print $1}')
    else
        MAIN_URL=$(vercel ls | head -2 | tail -1 | awk '{print $1}')
    fi
    
    log_success "Main app deployed to: $MAIN_URL"
    
    # Test endpoint (if curl available)
    if command -v curl &> /dev/null; then
        log_info "Testing endpoint health..."
        if curl -f -s -o /dev/null -w "%{http_code}" "$MAIN_URL" | grep -q "200"; then
            log_success "Health check passed (200 OK)"
        else
            log_warning "Health check failed - endpoint may not be ready"
        fi
    fi
}

record_rollback() {
    log "Recording rollback details..."
    
    RECORD_FILE="rollback-record-${ENVIRONMENT}-$(date +%Y%m%d-%H%M%S).json"
    
    cat > "$RECORD_FILE" << EOF
{
  "timestamp": "$TIMESTAMP",
  "environment": "$ENVIRONMENT",
  "target": "$DEPLOYMENT_URL",
  "apps": ["main", "student", "admin"],
  "success": true,
  "log_file": "$LOG_FILE"
}
EOF
    
    log_success "Rollback record saved to: $RECORD_FILE"
}

notify_team() {
    log "Notifying team of rollback..."
    
    # Create summary message
    SUMMARY="🚨 Deployment Rollback

Environment: $ENVIRONMENT
Target: $DEPLOYMENT_URL
Timestamp: $TIMESTAMP

Status: Success
Apps: main, student, admin

Log file: $LOG_FILE"

    log "$SUMMARY"
    
    # Slack notification (if configured)
    if [ -n "$SLACK_WEBHOOK_URL" ]; then
        curl -X POST -H 'Content-type: application/json' \
            --data "{\"text\":\"$SUMMARY\"}" \
            "$SLACK_WEBHOOK_URL" 2>/dev/null || true
        log_info "Slack notification sent"
    fi
}

main() {
    echo ""
    echo -e "${BLUE}============================================${NC}"
    echo -e "${BLUE}AAH Deployment Rollback Script${NC}"
    echo -e "${BLUE}============================================${NC}"
    echo ""
    
    # Check prerequisites
    check_prerequisites
    
    # Show current deployments
    get_deployment_list
    
    # Identify target
    identify_target_deployment
    
    # Confirm
    confirm_rollback
    
    # Execute rollbacks
    log "Starting rollback process..."
    rollback_main_app
    rollback_student_app
    rollback_admin_app
    
    # Verify
    verify_rollback
    
    # Record and notify
    record_rollback
    notify_team
    
    # Summary
    echo ""
    echo -e "${GREEN}============================================${NC}"
    echo -e "${GREEN}ROLLBACK COMPLETED SUCCESSFULLY${NC}"
    echo -e "${GREEN}============================================${NC}"
    echo ""
    log "Rollback completed successfully"
    echo "Log file: $LOG_FILE"
    echo ""
}

# Run main function
main "$@"
