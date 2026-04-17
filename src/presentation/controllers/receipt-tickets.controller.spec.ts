/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Test, TestingModule } from "@nestjs/testing";
import { Decimal } from "decimal.js";
import { ReceiptTicketsController } from "./receipt-tickets.controller";
import { CreateReceiptTicketUseCase } from "../../application/use-cases/receipt-tickets/create-receipt-ticket.use-case";
import { AddReceiptLineUseCase } from "../../application/use-cases/receipt-tickets/add-receipt-line.use-case";
import { UpdateReceiptLineUseCase } from "../../application/use-cases/receipt-tickets/update-receipt-line.use-case";
import { DeleteReceiptLineUseCase } from "../../application/use-cases/receipt-tickets/delete-receipt-line.use-case";
import { ListReceiptTicketsUseCase } from "../../application/use-cases/receipt-tickets/list-receipt-tickets.use-case";
import { GetReceiptTicketUseCase } from "../../application/use-cases/receipt-tickets/get-receipt-ticket.use-case";
import { ConfirmReceiptTicketUseCase } from "../../application/use-cases/receipt-tickets/confirm-receipt-ticket.use-case";
import { DeleteReceiptTicketUseCase } from "../../application/use-cases/receipt-tickets/delete-receipt-ticket.use-case";
import { ReceiptTicketEntity } from "../../domain/entities/receipt-ticket.entity";
import { ReceiptTicketLineEntity } from "../../domain/entities/receipt-ticket-line.entity";
import { JwtAuthGuard } from "../guards/jwt-auth.guard";
import { RbacGuard } from "../guards/rbac.guard";
import { TransactionStatus, UserRole } from "../../domain/enums";

describe("ReceiptTicketsController", () => {
  let controller: ReceiptTicketsController;
  let createUseCase: CreateReceiptTicketUseCase;
  let addLineUseCase: AddReceiptLineUseCase;
  let listUseCase: ListReceiptTicketsUseCase;
  let getUseCase: GetReceiptTicketUseCase;
  let confirmUseCase: ConfirmReceiptTicketUseCase;
  let deleteUseCase: DeleteReceiptTicketUseCase;

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
          provide: UpdateReceiptLineUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: DeleteReceiptLineUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: ListReceiptTicketsUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: GetReceiptTicketUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: ConfirmReceiptTicketUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: DeleteReceiptTicketUseCase,
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
    getUseCase = module.get<GetReceiptTicketUseCase>(GetReceiptTicketUseCase);
    confirmUseCase = module.get<ConfirmReceiptTicketUseCase>(
      ConfirmReceiptTicketUseCase,
    );
    deleteUseCase = module.get<DeleteReceiptTicketUseCase>(
      DeleteReceiptTicketUseCase,
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

  describe("findOne", () => {
    it("should get receipt details", async () => {
      const ticketId = 1;
      const expectedResult = {
        id: ticketId,
        ticketNo: "PN-202604-1",
        date: new Date(),
        status: TransactionStatus.DRAFT,
        createdBy: 1,
        note: "Test note",
        createdAt: new Date(),
        updatedAt: new Date(),
        lines: [
          new ReceiptTicketLineEntity({
            id: 1,
            ticketId,
            productId: 1,
            quantity: new Decimal(2),
            unitCode: "roll",
            areaM2: new Decimal(100),
            weightKg: new Decimal(50),
          }),
        ],
        totalM2: new Decimal(100),
        totalKg: new Decimal(50),
        totalRolls: new Decimal(2),
      };

      jest
        .spyOn(getUseCase, "execute")
        .mockResolvedValue(expectedResult as any);

      const result = await controller.findOne(ticketId);

      expect(result.id).toBe(ticketId);
      expect(result.ticketNo).toBe("PN-202604-1");
      expect(result.lines).toHaveLength(1);
      expect(result.totalM2).toBe("100.000");
      expect(result.totalKg).toBe("50.000");
      expect(result.totalRolls).toBe("2.000");
      expect(getUseCase.execute).toHaveBeenCalledWith(ticketId);
    });
  });

  describe("create", () => {
    it("should create a receipt ticket", async () => {
      const now = new Date();
      const dto = {
        note: "Test note",
        lines: [
          {
            productId: 1,
            quantity: "1.000",
            unitCode: "roll",
          },
        ],
      };
      const req = { user: { id: 1 } };
      const expectedResult = {
        id: 1,
        ticketNo: "PN-202604-1",
        date: now,
        status: "DRAFT",
        createdBy: 1,
        creatorId: 1,
        note: "Test note",
        createdAt: now,
        updatedAt: now,
      };

      jest
        .spyOn(createUseCase, "execute")
        .mockResolvedValue(expectedResult as unknown as ReceiptTicketEntity);

      const result = await controller.create(
        req as { user: { id: number } },
        dto as any,
      );

      expect(result).toEqual(expectedResult);
      expect(createUseCase.execute).toHaveBeenCalledWith(
        {
          note: dto.note,
          lines: [
            {
              productId: 1,
              quantity: new Decimal("1.000"),
              unitCode: "roll",
              lengthM: undefined,
            },
          ],
        },
        req.user.id,
      );
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
      const req = { user: { role: UserRole.WAREHOUSE_STAFF, id: 1 } };
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

      const result = await controller.addLine(ticketId, req as any, dto);

      expect(result.id).toBe(expectedResult.id);
      expect(result.quantity).toBe("1.000");
      expect(result.areaM2).toBe("75.000");
      expect(addLineUseCase.execute).toHaveBeenCalledWith(
        ticketId,
        {
          ...dto,
          quantity: new Decimal("1.000"),
          lengthM: new Decimal("50.000"),
        },
        false,
        1,
      );
    });
  });

  describe("confirm", () => {
    it("should confirm a receipt ticket", async () => {
      const ticketId = 1;
      const req = { user: { id: 1 } };
      const expectedResult = new ReceiptTicketEntity({
        id: 1,
        ticketNo: "PN-202604-1",
        date: new Date(),
        status: TransactionStatus.CONFIRMED,
        createdBy: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      jest.spyOn(confirmUseCase, "execute").mockResolvedValue(expectedResult);

      const result = await controller.confirm(ticketId, req as any);

      expect(result.status).toBe(TransactionStatus.CONFIRMED);
      expect(confirmUseCase.execute).toHaveBeenCalledWith(ticketId, 1);
    });
  });

  describe("delete", () => {
    it("should delete a receipt ticket", async () => {
      const ticketId = 1;
      const req = { user: { role: UserRole.ADMIN, id: 1 } };

      jest.spyOn(deleteUseCase, "execute").mockResolvedValue(undefined);

      await controller.delete(ticketId, req as any);

      expect(deleteUseCase.execute).toHaveBeenCalledWith(ticketId, true, 1);
    });
  });
});
