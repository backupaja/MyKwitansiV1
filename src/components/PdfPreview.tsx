import React from "react";
import { PDFViewer } from "@react-pdf/renderer";
import { UndanganDocument } from "../documents/UndanganDocument";
import type { DataUndanganView } from "../types";

export default function PdfPreview({ data }: { data: DataUndanganView }) {
  return (
    <PDFViewer className="w-full h-full border-0">
      <UndanganDocument data={data} />
    </PDFViewer>
  );
}
