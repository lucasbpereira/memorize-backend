import {
  Controller,
  Get,
  Param,
  Post,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { PDFDocument } from 'pdf-lib';
import * as fs from 'fs/promises';
import path from 'path';
import { Response } from 'express';

@Controller('upload')
export class UploadControllerController {
  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, callback) => {
          const sanitizedFileName = file.originalname.replace(
            /[^a-zA-Z0-9.]/g,
            '',
          );
          callback(null, sanitizedFileName);
        },
      }),
    }),
  )
  async uploadFile(@UploadedFile() file) {
    const filePath = `./uploads/${file.filename}`;

    try {
      const pdfBuffer = await fs.readFile(filePath);
      const pdfDoc = await PDFDocument.load(pdfBuffer);

      const pageFolder = await this.createPageFolder(file.filename, pdfDoc);

      return {
        filename: file.filename,
        numberOfPages: pdfDoc.getPageCount(),
        pageFolder,
      };
    } catch (error) {
      console.error('Error reading the PDF file:', error);
      throw new Error('Error processing the PDF file');
    }
  }

  private async createPageFolder(
    originalFilename: string,
    pdfDoc: PDFDocument,
  ) {
    const randomName = this.generateRandomName();
    const folderPath = `./uploads/${originalFilename.replace(/\.[^/.]+$/, '')}_${randomName}`;
    await fs.mkdir(folderPath, { recursive: true });

    await this.splitPdfIntoPages(pdfDoc, folderPath, originalFilename);

    return folderPath;
  }

  private async splitPdfIntoPages(
    pdfDoc: PDFDocument,
    folderPath: string,
    originalFilename: string,
  ) {
    await Promise.all(
      Array.from({ length: pdfDoc.getPageCount() }, async (_, index) => {
        const copiedPages = await PDFDocument.create();
        const [copiedPage] = await copiedPages.copyPages(pdfDoc, [index]);
        copiedPages.addPage(copiedPage);

        const pageFilePath = `${folderPath}/${originalFilename.replace(/\.[^/.]+$/, '')}_page_${index + 1}.pdf`;
        const pageBuffer = await copiedPages.save();
        await fs.writeFile(pageFilePath, pageBuffer);
      }),
    );
  }

  private generateRandomName(): string {
    return Array(32)
      .fill(null)
      .map(() => Math.round(Math.random() * 16).toString(16))
      .join('');
  }

  @Get(':folderName/:fileName')
  async getPdf(
    @Param('folderName') folderName: string,
    @Param('fileName') fileName: string,
    @Res() res: Response,
  ) {
    const currentDir = process.cwd(); // Obtém o diretório de trabalho atual

    const filePath = path.join(currentDir, `uploads/${folderName}/${fileName}`);

    // Configurar os cabeçalhos apropriados para o PDF
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename=${fileName}`);

    // Enviar o arquivo como resposta
    return res.sendFile(filePath);
  }
}
