import { DeleteCustomerUseCase } from "./delete-customer.use-case";
import { ICustomerRepository } from "../../../domain/contracts/customer.repository.interface";
import {
  CustomerNotFoundException,
  CustomerHasIssueTicketsException,
} from "../../../domain/exceptions/customer.exceptions";
import { CustomerEntity } from "../../../domain/entities/customer.entity";

describe("DeleteCustomerUseCase", () => {
  let useCase: DeleteCustomerUseCase;
  let repository: jest.Mocked<Partial<ICustomerRepository>>;

  beforeEach(() => {
    repository = {
      findById: jest.fn(),
      countIssueTickets: jest.fn(),
      delete: jest.fn(),
    };
    useCase = new DeleteCustomerUseCase(repository as ICustomerRepository);
  });

  it("should delete customer when it exists and has no tickets", async () => {
    const customer = new CustomerEntity({ id: 1 });
    (repository.findById as jest.Mock).mockResolvedValue(customer);
    (repository.countIssueTickets as jest.Mock).mockResolvedValue(0);

    await useCase.execute(1);

    expect(repository.findById).toHaveBeenCalledWith(1);
    expect(repository.countIssueTickets).toHaveBeenCalledWith(1);
    expect(repository.delete).toHaveBeenCalledWith(1);
  });

  it("should throw CustomerNotFoundException when customer does not exist", async () => {
    (repository.findById as jest.Mock).mockResolvedValue(null);

    await expect(useCase.execute(1)).rejects.toThrow(CustomerNotFoundException);
  });

  it("should throw CustomerHasIssueTicketsException when customer has tickets", async () => {
    const customer = new CustomerEntity({ id: 1 });
    (repository.findById as jest.Mock).mockResolvedValue(customer);
    (repository.countIssueTickets as jest.Mock).mockResolvedValue(1);

    await expect(useCase.execute(1)).rejects.toThrow(
      CustomerHasIssueTicketsException,
    );
  });
});
