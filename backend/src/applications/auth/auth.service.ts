import { patientRepository } from "../../repositories/users/users.repository";
import { authOtpService } from "./otp.service";
import { AppError } from "../../shared/errors/app-errors";
import { decodeJwt, signJwt, verifyJwt } from "../../infrastructure/auth/jwt";
import {
  baseJwtPayload,
  patientJwtPayload,
} from "../../shared/auth/auth.types";
import { authRepository } from "../../repositories/auth/auth.repository";
import { authStore } from "../../stores/auth/auth.store";
import { PoolClient } from "pg";

class AuthService {
  private async validateRefreshToken<T extends baseJwtPayload>(
    refreshToken: string,
  ): Promise<T> {
    const decoded = verifyJwt<T>(refreshToken);

    if (!decoded) {
      throw new AppError("Invalid refresh token", 403, "INVALID_REFRESH_TOKEN");
    }

    let chachedToken = await authStore.getRefreshToken(
      refreshToken,
      decoded.sub,
    );

    if (!chachedToken) {
      const storedRefresh = await authRepository.getRefereshToken(
        decoded.sub,
        refreshToken,
      );

      if (storedRefresh) {
        chachedToken = storedRefresh.token_hash;

        await authStore.storeRefeshToken(
          storedRefresh?.token_hash,
          decoded.sub,
        );

        const decodedToken = decodeJwt<T>(chachedToken);

        if (!decodedToken || decodedToken.expired) {
          await this.userLogout(chachedToken);
          throw new AppError(
            "Invalid refresh token",
            403,
            "INVALID_REFRESH_TOKEN",
          );
        }
      } else {
        throw new AppError(
          "Invalid refresh token",
          403,
          "INVALID_REFRESH_TOKEN",
        );
      }
    }

    return decoded;
  }

  async patientLogin(
    phoneNumber: string,
    client?: PoolClient,
  ): Promise<object> {
    if (!phoneNumber) {
      throw new AppError(
        "Invalid authentication method",
        403,
        "INVALID_AUTH_TYPE",
      );
    }
    const exists = await patientRepository.checkPatientUserExists(
      phoneNumber,
      client,
    );
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

    const user = await patientRepository.getPatientUser(phoneNumber);
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
    await authRepository.saveRefershTokenToDB({
      userId: user.userId,
      userType: "PATIENT",
      tokenHash: refreshToken,
    });
    await authStore.storeRefeshToken(refreshToken, user.userId);
    return { accessToken, refreshToken };
  }

  async refreshPatientAccessToken(
    refreshToken: string,
  ): Promise<{ accessToken: string }> {
    const decoded =
      await this.validateRefreshToken<patientJwtPayload>(refreshToken);

    let jwtPayLoad: patientJwtPayload = {
      role: "PATIENT",
      sub: decoded.sub,
    };
    decoded.pid != null && (jwtPayLoad.pid = decoded.pid);
    const accessToken = signJwt<patientJwtPayload>(jwtPayLoad, "ACCESS");
    return { accessToken };
  }

  async userLogout(refreshToken: string): Promise<void> {
    const decode = decodeJwt<baseJwtPayload>(refreshToken);
    if (decode) {
      await authRepository.revokeRefereshToken(decode.sub, refreshToken);
      await authStore.invalidateToken(refreshToken, decode.sub);
    }
  }
}

export const authService = new AuthService();
