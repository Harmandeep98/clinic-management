import { patientRegisterType } from "../../http/users/user.schemas";
import { withTransaction } from "../../infrastructure/db/transaction";
import {
  patientRepository,
  userRepository,
} from "../../repositories/users/users.repository";
import { AppError } from "../../shared/errors/app-errors";
import { authService } from "../auth/auth.service";

class PatientService {
  async registerNewPatient(patientData: patientRegisterType): Promise<void> {
    await withTransaction(async (client) => {
      if (!patientData.phoneNumber) {
        throw new AppError("Invalid authentication method", 502, "INVALID AUTHENTICATION METHOD");
      }
      await userRepository.createOrUpdateUser(client, patientData);
      await patientRepository.createOrUpdatePatient(client, patientData);
    });
  }
}

export const patientService = new PatientService();
