/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from "@nestjs/testing";
import { ReceiptTicketsController } from "./receipt-tickets.controller";
import { CreateReceiptTicketUseCase } from "../../application/use-cases/receipt-tickets/create-receipt-ticket.use-case";
import { ReceiptTicketEntity } from "../../domain/entities/receipt-ticket.entity";
import { JwtAuthGuard } from "../guards/jwt-auth.guard";

describe("ReceiptTicketsController", () => {
  let controller: ReceiptTicketsController;
  let createUseCase: CreateReceiptTicketUseCase;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReceiptTicketsController],
      providers: [
        {
          provide: CreateReceiptTicketUseCase,
          useValue: { execute: jest.fn() },
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<ReceiptTicketsController>(ReceiptTicketsController);
    createUseCase = module.get<CreateReceiptTicketUseCase>(
      CreateReceiptTicketUseCase,
    );
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("create", () => {
    it("should create a receipt ticket", async () => {
      const dto = { note: "Test note" };
      const req = { user: { id: 1 } };
      const expectedResult = {
        id: 1,
        ticketNo: "PN-202604-1",
        date: new Date(),
        status: "DRAFT",
        createdBy: 1,
        note: "Test note",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest
        .spyOn(createUseCase, "execute")
        .mockResolvedValue(expectedResult as unknown as ReceiptTicketEntity);

      const result = await controller.create(
        req as { user: { id: number } },
        dto,
      );

      expect(result).toEqual(expectedResult);
      expect(createUseCase.execute).toHaveBeenCalledWith(dto, req.user.id);
    });
  });
});
