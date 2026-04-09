/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from "@nestjs/testing";
import { Decimal } from "decimal.js";
import { ReceiptTicketsController } from "./receipt-tickets.controller";
import { CreateReceiptTicketUseCase } from "../../application/use-cases/receipt-tickets/create-receipt-ticket.use-case";
import { AddReceiptLineUseCase } from "../../application/use-cases/receipt-tickets/add-receipt-line.use-case";
import { ListReceiptTicketsUseCase } from "../../application/use-cases/receipt-tickets/list-receipt-tickets.use-case";
import { ReceiptTicketEntity } from "../../domain/entities/receipt-ticket.entity";
import { ReceiptTicketLineEntity } from "../../domain/entities/receipt-ticket-line.entity";
import { JwtAuthGuard } from "../guards/jwt-auth.guard";
import { RbacGuard } from "../guards/rbac.guard";
import { TransactionStatus } from "../../domain/enums";

describe("ReceiptTicketsController", () => {
  let controller: ReceiptTicketsController;
  let createUseCase: CreateReceiptTicketUseCase;
  let addLineUseCase: AddReceiptLineUseCase;
  let listUseCase: ListReceiptTicketsUseCase;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReceiptTicketsController],
      providers: [
        {
          provide: CreateReceiptTicketUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: AddReceiptLineUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: ListReceiptTicketsUseCase,
          useValue: { execute: jest.fn() },
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RbacGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<ReceiptTicketsController>(ReceiptTicketsController);
    createUseCase = module.get<CreateReceiptTicketUseCase>(
      CreateReceiptTicketUseCase,
    );
    addLineUseCase = module.get<AddReceiptLineUseCase>(AddReceiptLineUseCase);
    listUseCase = module.get<ListReceiptTicketsUseCase>(
      ListReceiptTicketsUseCase,
    );
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("findAll", () => {
    it("should list receipt tickets", async () => {
      const query = { page: 1, limit: 10 };
      const expectedResult = {
        data: [
          new ReceiptTicketEntity({
            id: 1,
            ticketNo: "PN-202604-1",
            date: new Date(),
            status: TransactionStatus.DRAFT,
            createdBy: 1,
            createdAt: new Date(),
            updatedAt: new Date(),
          }),
        ],
        meta: { total: 1, page: 1, lastPage: 1 },
      };

      jest.spyOn(listUseCase, "execute").mockResolvedValue(expectedResult);

      const result = await controller.findAll(query);

      expect(result.statusCode).toBe(200);
      expect(result.data).toHaveLength(1);
      expect(result.data[0].ticketNo).toBe("PN-202604-1");
      expect(listUseCase.execute).toHaveBeenCalledWith({
        ...query,
        fromDate: undefined,
        toDate: undefined,
      });
    });
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

  describe("addLine", () => {
    it("should add a line to a receipt ticket", async () => {
      const ticketId = 1;
      const dto = {
        productId: 1,
        quantity: "1.000",
        unitCode: "roll",
        lengthM: "50.000",
      };
      const expectedResult = new ReceiptTicketLineEntity({
        id: 1,
        ticketId,
        productId: 1,
        quantity: new Decimal("1.000"),
        unitCode: "roll",
        lengthM: new Decimal("50.000"),
        areaM2: new Decimal("75.000"),
        weightKg: new Decimal("15.000"),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      jest.spyOn(addLineUseCase, "execute").mockResolvedValue(expectedResult);

      const result = await controller.addLine(ticketId, dto);

      expect(result.id).toBe(expectedResult.id);
      expect(result.quantity).toBe("1.000");
      expect(result.areaM2).toBe("75.000");
      expect(addLineUseCase.execute).toHaveBeenCalledWith(ticketId, {
        ...dto,
        quantity: new Decimal("1.000"),
        lengthM: new Decimal("50.000"),
      });
    });
  });
});
