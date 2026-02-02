import { userRepository } from "../../repositories/users/users.repository";
import { authOtpService } from "./otp.service";
import { AppError } from "../../shared/errors/app-errors";
import { signJwt } from "../../infrastructure/auth/jwt";
import { patientJwtPayload } from "../../shared/auth/auth.types";

class AuthService {
  async patientLogin(phoneNumber: string): Promise<object> {
    if (!phoneNumber) {
      throw new AppError(
        "Invalid authentication method",
        403,
        "INVALID_AUTH_TYPE",
      );
    }
    const exists = await userRepository.checkPatientUserExists(phoneNumber);

    if (!exists) {
      throw new AppError(
        "Account is not registered with us please register.",
        404,
        "USER_NOT_FOUND",
      );
    }

    const otpResult = await authOtpService.sendAuthOtp(phoneNumber, "PATIENT");

    return otpResult;
  }

  async patientOtpVerify(phoneNumber: string, otp: string) {
    await authOtpService.verifyOtp(otp, phoneNumber, "PATIENT");

    const user = await userRepository.getPatientUser(phoneNumber);

    if (!user) {
      throw new AppError("Invalid Credentials", 401, "INVALID_CREDENTIALS");
    }

    let jwtPayLoad: patientJwtPayload = {
      role: "PATIENT",
      sub: user.userId,
    };

    user.patientId != null && (jwtPayLoad.pid = user.patientId);

    const accessToken = signJwt<patientJwtPayload>(jwtPayLoad, "ACCESS");
    const refreshToken = signJwt<patientJwtPayload>(jwtPayLoad, "REFRESH");

    return { accessToken, refreshToken };
  }
}

export const authService = new AuthService();
