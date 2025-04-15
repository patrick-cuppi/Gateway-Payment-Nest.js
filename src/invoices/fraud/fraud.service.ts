import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ProcessInvoiceFraudDto } from '../dto/process-invoice-fraud.dto';
import { InvoiceStatus } from '@prisma/client';
import { FraudAggregateSpecification } from './specifications/fraud-aggregate.specification';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InvoiceProcessedEvent } from '../events/invoice-processed.event';

@Injectable()
export class FraudService {
  constructor(
    private prismaService: PrismaService,
    private fraudAggregateSpec: FraudAggregateSpecification,
    private eventEmitter: EventEmitter2,
  ) {}

  async processInvoice(processInvoiceFraudDto: ProcessInvoiceFraudDto) {
    const { invoice_id, account_id, amount } = processInvoiceFraudDto;

    return this.prismaService.$transaction(async (prisma) => {
      const foundInvoice = await prisma.invoice.findUnique({
        where: {
          id: invoice_id,
        },
      });

      if (foundInvoice) {
        throw new Error('Invoice has already been processed');
      }

      const account = await prisma.account.upsert({
        where: {
          id: account_id,
        },
        update: {},
        create: {
          id: account_id,
        },
      });

      const fraudResult = await this.fraudAggregateSpec.detectFraud({
        account,
        amount,
        invoiceId: invoice_id,
      });

      const invoice = await prisma.invoice.create({
        data: {
          id: invoice_id,
          accountId: account.id,
          amount,
          ...(fraudResult.hasFraud && {
            fraudHistory: {
              create: {
                reason: fraudResult.reason!,
                description: fraudResult.description,
              },
            },
          }),
          status: fraudResult.hasFraud
            ? InvoiceStatus.REJECTED
            : InvoiceStatus.APPROVED,
        },
      });

      await this.eventEmitter.emitAsync(
        'invoice.processed',
        new InvoiceProcessedEvent(invoice, fraudResult),
      );

      return {
        invoice,
        fraudResult,
      };
    });
  }