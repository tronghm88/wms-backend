import { Module } from "@nestjs/common";
import { PrismaModule } from "../database/prisma.module";
import { CUSTOMER_REPOSITORY } from "../../domain/contracts/customer.repository.interface";
import { CustomerRepository } from "../database/repositories/customer.repository";
import { CreateCustomerUseCase } from "../../application/use-cases/customers/create-customer.use-case";
import { GetCustomersUseCase } from "../../application/use-cases/customers/get-customers.use-case";
import { UpdateCustomerUseCase } from "../../application/use-cases/customers/update-customer.use-case";
import { CustomersController } from "../../presentation/controllers/customers.controller";

@Module({
  imports: [PrismaModule],
  controllers: [CustomersController],
  providers: [
    {
      provide: CUSTOMER_REPOSITORY,
      useClass: CustomerRepository,
    },
    CreateCustomerUseCase,
    GetCustomersUseCase,
    UpdateCustomerUseCase,
  ],
  exports: [
    CUSTOMER_REPOSITORY,
    CreateCustomerUseCase,
    GetCustomersUseCase,
    UpdateCustomerUseCase,
  ],
})
export class CustomersModule {}
