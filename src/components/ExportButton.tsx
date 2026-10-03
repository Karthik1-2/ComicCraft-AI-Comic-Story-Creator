import React, { useState } from 'react';
import { Download, FileImage, FileText, Loader2 } from 'lucide-react';
import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';
import { ComicData } from '../types.ts';

interface ExportButtonProps {
  targetRef: React.RefObject<HTMLDivElement | null>;
  comic: ComicData;
}

export const ExportButton: React.FC<ExportButtonProps> = ({ targetRef, comic }) => {
  const [isExporting, setIsExporting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleExportPng = async () => {
    if (!targetRef.current) return;
    setIsExporting(true);
    setIsOpen(false);
    try {
      const dataUrl = await toPng(targetRef.current, {
        quality: 0.95,
        backgroundColor: '#090d16',
        pixelRatio: 2,
      });

      const link = document.createElement('a');
      link.download = `${comic.title.toLowerCase().replace(/[^a-z0-9]/g, '-') || 'comic'}-comiccraft.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to export comic as PNG:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportPdf = async () => {
    if (!targetRef.current) return;
    setIsExporting(true);
    setIsOpen(false);
    try {
      const dataUrl = await toPng(targetRef.current, {
        quality: 0.92,
        backgroundColor: '#090d16',
        pixelRatio: 2,
      });

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: 'a4',
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      const img = new Image();
      img.src = dataUrl;
      await new Promise(resolve => {
        img.onload = resolve;
      });

      const imgWidth = pageWidth - 20;
      const imgHeight = (img.height * imgWidth) / img.width;

      pdf.addImage(dataUrl, 'PNG', 10, 10, imgWidth, Math.min(imgHeight, pageHeight - 20));
      pdf.save(`${comic.title.toLowerCase().replace(/[^a-z0-9]/g, '-') || 'comic'}-comiccraft.pdf`);
    } catch (err) {
      console.error('Failed to export comic as PDF:', err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isExporting}
        className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 hover:border-slate-500 shadow-md transition-all disabled:opacity-50"
      >
        {isExporting ? (
          <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
        ) : (
          <Download className="w-4 h-4 text-amber-400" />
        )}
        <span>Export Comic</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-slate-900 border-2 border-black rounded-xl shadow-[5px_5px_0px_#000] p-1.5 z-50">
          <button
            onClick={handleExportPng}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-800 hover:text-white rounded-lg transition-colors text-left"
          >
            <FileImage className="w-4 h-4 text-amber-400" />
            <span>Download High-Res PNG</span>
          </button>
          <button
            onClick={handleExportPdf}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-800 hover:text-white rounded-lg transition-colors text-left"
          >
            <FileText className="w-4 h-4 text-rose-400" />
            <span>Download Comic PDF</span>
          </button>
        </div>
      )}
    </div>
  );
};
