import {
  Inject,
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import {
  SPLIT_TICKET_REPOSITORY,
  type ISplitTicketRepository,
} from "../../../domain/contracts/split-ticket.repository.interface";
import { SplitTicketEntity } from "../../../domain/entities/split-ticket.entity";
import { TransactionStatus } from "../../../domain/enums";
import { UpdateSplitTicketDto } from "../../../presentation/dtos/split-tickets/update-split-ticket.dto";

@Injectable()
export class UpdateSplitTicketUseCase {
  constructor(
    @Inject(SPLIT_TICKET_REPOSITORY)
    private readonly splitTicketRepository: ISplitTicketRepository,
  ) {}

  async execute(
    id: number,
    dto: UpdateSplitTicketDto,
  ): Promise<SplitTicketEntity> {
    // 1. Find ticket
    const ticket = await this.splitTicketRepository.findById(id);
    if (!ticket) {
      throw new NotFoundException(`Split ticket with ID ${id} not found`);
    }

    // 2. Only allow update if DRAFT
    if (ticket.status !== TransactionStatus.DRAFT) {
      throw new BadRequestException(
        "Only split tickets in DRAFT status can be updated",
      );
    }

    const updateData: Partial<SplitTicketEntity> = {};

    // 3. Map fields
    if (dto.note !== undefined) {
      updateData.note = dto.note;
    }

    if (dto.date) {
      updateData.date = new Date(dto.date);
    }

    // 4. Perform update
    return await this.splitTicketRepository.update(id, updateData);
  }
}
