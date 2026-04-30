<?php

namespace App\Core;

use TCPDF;

class PDF extends TCPDF
{
    /**
     * Generate PDF from HTML
     *
     * @param  string  $html  HTML content
     * @param  string  $filename  Output filename
     * @param  string  $orientation  Page orientation (P=Portrait, L=Landscape)
     * @param  string  $paperSize  Paper size (A4, Letter, etc)
     * @return TCPDF instance
     */
    public static function generate($html, $filename = 'document.pdf', $orientation = 'P', $paperSize = 'A4')
    {
        // Define K_PATH_IMAGES if not already defined
        if (! defined('K_PATH_IMAGES')) {
            define('K_PATH_IMAGES', dirname(dirname(__DIR__)).'/public/assets/img/');
        }

        // Create new PDF document
        $pdf = new self($orientation, 'mm', $paperSize, true, 'UTF-8', false);

        // Set document information
        $pdf->SetCreator('SIGAP-PNJ');
        $pdf->SetAuthor('Politeknik Negeri Jakarta');
        $pdf->SetTitle($filename);

        // Remove default header/footer
        $pdf->setPrintHeader(false);
        $pdf->setPrintFooter(false);

        // Set margins - REDUCED untuk spacing lebih rapat
        $pdf->SetMargins(20, 15, 20); // Left, Top, Right
        $pdf->SetAutoPageBreak(true, 15);

        // Add a page FIRST
        $pdf->AddPage();

        // Set font AFTER AddPage - Times New Roman untuk dokumen formal
        // Use 'times' which is TCPDF built-in Times New Roman equivalent
        $pdf->SetFont('times', '', 12);

        // Set image scale
        $pdf->setImageScale(PDF_IMAGE_SCALE_RATIO);

        // CRITICAL: Set cell padding to MINIMAL for tighter spacing
        $pdf->setCellPaddings(0, 0, 0, 0); // Left, Top, Right, Bottom - ALL ZERO

        // Set cell margins to MINIMAL
        $pdf->setCellMargins(0, 0, 0, 0); // Left, Top, Right, Bottom - ALL ZERO

        // Set line height multiplier for tighter text spacing
        $pdf->setCellHeightRatio(1.1); // Reduced from default 1.25

        // Enable tag processing for better HTML/CSS support
        $pdf->setHtmlVSpace(['p' => [0 => ['h' => 0.5, 'n' => 0.5], 1 => ['h' => 0.5, 'n' => 0.5]]]);
        $pdf->setHtmlVSpace(['div' => [0 => ['h' => 0.3, 'n' => 0.3], 1 => ['h' => 0.3, 'n' => 0.3]]]);

        // Write HTML content
        $pdf->writeHTML($html, true, false, true, false, '');

        return $pdf;
    }

    /**
     * Generate and output PDF to browser (download)
     */
    public static function download($html, $filename = 'document.pdf', $orientation = 'P', $paperSize = 'A4')
    {
        $pdf = self::generate($html, $filename, $orientation, $paperSize);

        // Output PDF for download
        $pdf->Output($filename, 'D'); // D = force download
        exit;
    }

    /**
     * Generate and display PDF inline in browser
     */
    public static function preview($html, $filename = 'document.pdf', $orientation = 'P', $paperSize = 'A4')
    {
        $pdf = self::generate($html, $filename, $orientation, $paperSize);

        // Output PDF inline
        $pdf->Output($filename, 'I'); // I = inline display
        exit;
    }

    /**
     * Generate and save PDF to file
     */
    public static function save($html, $filepath, $orientation = 'P', $paperSize = 'A4')
    {
        $filename = basename($filepath);
        $pdf = self::generate($html, $filename, $orientation, $paperSize);

        // Output PDF to file
        $pdf->Output($filepath, 'F'); // F = save to file

        return $filepath;
    }

    /**
     * Generate and return PDF as string
     */
    public static function getString($html, $filename = 'document.pdf', $orientation = 'P', $paperSize = 'A4')
    {
        $pdf = self::generate($html, $filename, $orientation, $paperSize);

        // Output PDF as string
        return $pdf->Output('', 'S'); // S = return as string
    }
}
