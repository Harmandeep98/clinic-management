import { clinicRegisterType } from "../../http/clinics/clinic.schemas";
import { withTransaction } from "../../infrastructure/db/transaction";
import { clinicRepo } from "../../repositories/clinics/clinic.repository";
import { userRepository } from "../../repositories/users/users.repository";
import { AppError } from "../../shared/errors/app-errors";
import { slugify, generateUniqueSlug } from "../../shared/utils/slugify";

class ClinicService {
  async createClinic(clinicData: clinicRegisterType) {
    return await withTransaction(async (client) => {
      // Generate slug from name if not provided
      const baseSlug = clinicData.clinicSlug || slugify(clinicData.name);

      // Find existing slugs with same prefix for collision detection
      const existingSlugs = await clinicRepo.findSlugsWithPrefix(
        client,
        baseSlug,
      );

      // Generate unique slug using Set for O(1) lookup
      const uniqueSlug = generateUniqueSlug(baseSlug, existingSlugs);

      // Create clinic with the generated slug
      const result = await clinicRepo.createClinc(client, {
        ...clinicData,
        clinicSlug: uniqueSlug,
      });
      if (!result) {
        throw new AppError(
          "Unable to create clinic",
          403,
          "CREATE_CLINIC_FAILED",
        );
      }
      await clinicRepo.createClinicCounter(client, result.clinicId);
      await userRepository.createOrUpdateUser(client, {
        id: clinicData.adminName,
        email: clinicData.email,
      });
      return result;
    });
  }
}

export const clinicService = new ClinicService();
