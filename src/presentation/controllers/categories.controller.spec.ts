/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from "@nestjs/testing";
import { CategoriesController } from "./categories.controller";
import { CreateCategoryUseCase } from "../../application/use-cases/categories/create-category.use-case";
import { UpdateCategoryUseCase } from "../../application/use-cases/categories/update-category.use-case";
import { GetCategoriesUseCase } from "../../application/use-cases/categories/get-categories.use-case";
import { RbacGuard } from "../guards/rbac.guard";
import { JwtAuthGuard } from "../guards/jwt-auth.guard";

describe("CategoriesController", () => {
  let controller: CategoriesController;
  let getCategoriesUseCase: GetCategoriesUseCase;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoriesController],
      providers: [
        {
          provide: CreateCategoryUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: UpdateCategoryUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: GetCategoriesUseCase,
          useValue: { execute: jest.fn() },
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RbacGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<CategoriesController>(CategoriesController);
    getCategoriesUseCase =
      module.get<GetCategoriesUseCase>(GetCategoriesUseCase);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("findAll", () => {
    it("should return an array of categories", async () => {
      const categories = [
        {
          id: 1,
          code: "CAT1",
          name: "Category 1",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      jest.spyOn(getCategoriesUseCase, "execute").mockResolvedValue(categories);

      const result = await controller.findAll();

      expect(result).toBe(categories);
      expect(getCategoriesUseCase.execute).toHaveBeenCalled();
    });
  });
});
