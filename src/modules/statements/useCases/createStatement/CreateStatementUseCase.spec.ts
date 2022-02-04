import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementUseCase } from "./CreateStatementUseCase";
import { CreateStatementError } from "./CreateStatementError";

enum OperationType {
  DEPOSIT = "deposit",
  WITHDRAW = "withdraw",
  TRANSFER = "transfer",
}

let inMemoryUsersRepository: InMemoryUsersRepository;
let inMemoryStatementsRepository: InMemoryStatementsRepository;
let createUserUseCase: CreateUserUseCase;
let createStatementUseCase: CreateStatementUseCase;

describe("Create Statement", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
    createStatementUseCase = new CreateStatementUseCase(
      inMemoryUsersRepository,
      inMemoryStatementsRepository
    );
  });

  it("should be able a create a new statement", async () => {
    const { id } = await createUserUseCase.execute({
      name: "Create Statament Test",
      email: "createstatementtest@email.com",
      password: "123456",
    });

    const statement = await createStatementUseCase.execute({
      user_id: id as string,
      amount: 50,
      description: "deposit of 50",
      type: OperationType.DEPOSIT,
    });

    expect(statement).toHaveProperty("id");
  });

  it("should not be able to create a new statement if user not exists", () => {
    expect(
      createStatementUseCase.execute({
        user_id: "invalidId",
        amount: 50,
        description: "deposit of 50",
        type: OperationType.DEPOSIT,
      })
    ).rejects.toEqual(new CreateStatementError.UserNotFound());
  });

  it("should not be able to create a new withdraw statement if balance is lass then amount", async () => {
    const { id } = await createUserUseCase.execute({
      name: "Withdraw Statement Test",
      email: "withdrawstatementtest@email.com",
      password: "123456",
    });

    await createStatementUseCase.execute({
      user_id: id as string,
      amount: 30,
      description: "deposit of 30",
      type: OperationType.DEPOSIT,
    });

    await expect(
      createStatementUseCase.execute({
        user_id: id as string,
        amount: 50,
        description: "withdraw of 50",
        type: OperationType.WITHDRAW,
      })
    ).rejects.toEqual(new CreateStatementError.InsufficientFunds());
  });

  it("should be able to create a transfer statement", async () => {
    const { id: sender_id } = await createUserUseCase.execute({
      name: "Sender Transfer Statement Test",
      email: "transferstatementtest@email.com",
      password: "123456",
    });

    const { id: receiver_id } = await createUserUseCase.execute({
      name: "Receiver Transfer Statement Test",
      email: "receiverstatementtest@email.com",
      password: "123456",
    });

    await createStatementUseCase.execute({
      user_id: sender_id as string,
      amount: 100,
      description: "deposit of 100",
      type: OperationType.DEPOSIT,
    });

    const statement = await createStatementUseCase.execute({
      user_id: receiver_id as string,
      amount: 40,
      description: `transfer 40 to user_id:${receiver_id}`,
      type: OperationType.TRANSFER,
      sender_id,
    });

    expect(statement).toHaveProperty("id");
  });

  it("should not be albe to create a trasfer statement if sender is not suficent founds", async () => {
    const { id: sender_id } = await createUserUseCase.execute({
      name: "Sender Transfer Statement Test",
      email: "transferstatementtest@email.com",
      password: "123456",
    });

    const { id: receiver_id } = await createUserUseCase.execute({
      name: "Receiver Transfer Statement Test",
      email: "receiverstatementtest@email.com",
      password: "123456",
    });

    await expect(
      createStatementUseCase.execute({
        user_id: receiver_id as string,
        amount: 40,
        description: `transfer 40 to user_id:${receiver_id}`,
        type: OperationType.TRANSFER,
        sender_id,
      })
    ).rejects.toEqual(new CreateStatementError.InsufficientFunds());
  });
});
