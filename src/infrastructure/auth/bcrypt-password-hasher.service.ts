import { Injectable } from "@nestjs/common";
import * as bcrypt from "bcrypt";
import { IPasswordHasher } from "../../domain/contracts/password-hasher.interface";

@Injectable()
export class BcryptPasswordHasher implements IPasswordHasher {
  private readonly saltRounds = 10;

  async hash(plainText: string): Promise<string> {
    return bcrypt.hash(plainText, this.saltRounds);
  }

  async compare(plainText: string, hashed: string): Promise<boolean> {
    return bcrypt.compare(plainText, hashed);
  }
}
