import { userRepository } from "../../repositories/users/users.repository";
import { authOtpService } from "./otp.service";
import { AppError } from "../../shared/errors/app-errors";
import { signJwt, verifyJwt } from "../../infrastructure/auth/jwt";
import { patientJwtPayload } from "../../shared/auth/auth.types";
import { authRepository } from "../../repositories/auth/auth.repository";
import { authStore } from "../../stores/auth/auth.store";

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
    await authRepository.saveRefershTokenToDB({userId: user.userId, userType: "PATIENT", tokenHash: refreshToken});
    await authStore.storeRefeshToken(refreshToken, user.userId);
    return { accessToken, refreshToken };
  }

  async refreshPatientAccessToken(refreshToken: string, userId: string) {
    let chachedToken = await authStore.getRefreshToken(refreshToken, userId);
    if (!chachedToken) {
      const storedRefresh = await authRepository.getRefereshToken(userId, refreshToken);
      if (storedRefresh) {
        await authStore.storeRefeshToken(storedRefresh?.token_hash, userId);
        chachedToken = storedRefresh.token_hash;
      }
    }
    if (!chachedToken) {
      throw new AppError("Invalid refresh token", 403, "INVALID_REFRESH_TOKEN");
    }
    const decoded = verifyJwt<patientJwtPayload>(chachedToken);
    if (!decoded) {
      throw new AppError("Invalid refresh token", 403, "INVALID_REFRESH_TOKEN");
    }
    let jwtPayLoad: patientJwtPayload = {
      role: "PATIENT",
      sub: decoded.sub,
    };
    decoded.pid != null && (jwtPayLoad.pid = decoded.pid);
    const accessToken = signJwt<patientJwtPayload>(jwtPayLoad, "ACCESS");
    return { accessToken }
  }
}

export const authService = new AuthService();
