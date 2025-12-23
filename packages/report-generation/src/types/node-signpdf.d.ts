declare module "node-signpdf" {
  import { Buffer } from "buffer";

  export function signpdf(
    pdfBuffer: Buffer,
    signer: Buffer,
    options?: {
      passphrase?: string;
      asString?: boolean;
    },
  ): Buffer;

  export const plainAddPlaceholder: (
    pdfBuffer: Buffer,
    options: {
      reason?: string;
      location?: string;
      signatureLength?: number;
      page?: number;
    },
  ) => Buffer;
}
