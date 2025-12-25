"use client";

import { useState } from "react";
import { WidgetWrapper } from "./widget-wrapper";

interface DraggableWidget {
  id: string;
  component: React.ReactNode;
}

interface DashboardDragDropProps {
  widgets: DraggableWidget[];
  onWidgetsChange: (widgets: DraggableWidget[]) => void;
}

export function DashboardDragDrop({
  widgets,
  onWidgetsChange,
}: DashboardDragDropProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newWidgets = [...widgets];
    const [removed] = newWidgets.splice(draggedIndex, 1);
    newWidgets.splice(index, 0, removed);
    onWidgetsChange(newWidgets);
    setDraggedIndex(index);
  };

  const handleDrop = () => {
    setDraggedIndex(null);
  };

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {widgets.map((widget, index) => (
        <WidgetWrapper
          key={widget.id}
          draggable
          onDragStart={() => handleDragStart(index)}
          onDragOver={(e) => handleDragOver(e, index)}
          onDrop={handleDrop}
        >
          {widget.component}
        </WidgetWrapper>
      ))}
    </div>
  );
}
