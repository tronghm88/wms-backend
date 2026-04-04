/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from "@nestjs/testing";
import { CategoriesController } from "./categories.controller";
import { CreateCategoryUseCase } from "../../application/use-cases/categories/create-category.use-case";
import { UpdateCategoryUseCase } from "../../application/use-cases/categories/update-category.use-case";
import { GetCategoriesUseCase } from "../../application/use-cases/categories/get-categories.use-case";
import { GetCategoryByIdUseCase } from "../../application/use-cases/categories/get-category-by-id.use-case";
import { RbacGuard } from "../guards/rbac.guard";
import { JwtAuthGuard } from "../guards/jwt-auth.guard";

describe("CategoriesController", () => {
  let controller: CategoriesController;
  let getCategoriesUseCase: GetCategoriesUseCase;
  let getCategoryByIdUseCase: GetCategoryByIdUseCase;

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
        {
          provide: GetCategoryByIdUseCase,
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
    getCategoryByIdUseCase = module.get<GetCategoryByIdUseCase>(
      GetCategoryByIdUseCase,
    );
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

  describe("findOne", () => {
    it("should return a category by id", async () => {
      const categoryId = 1;
      const category = {
        id: categoryId,
        code: "CAT1",
        name: "Category 1",
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      jest.spyOn(getCategoryByIdUseCase, "execute").mockResolvedValue(category);

      const result = await controller.findOne(categoryId);

      expect(result).toBe(category);
      expect(getCategoryByIdUseCase.execute).toHaveBeenCalledWith(categoryId);
    });
  });
});
