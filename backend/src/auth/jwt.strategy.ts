import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy, JwtFromRequestFunction } from 'passport-jwt';

interface JwtPayload {
  sub: string;
  email: string;
}

// Função auxiliar para tipar corretamente o extrator JWT
function getJwtExtractor(): JwtFromRequestFunction {
  return ExtractJwt.fromAuthHeaderAsBearerToken();
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: getJwtExtractor(),
      ignoreExpiration: false,
      secretOrKey: 'secretKey', // Troque para variável de ambiente em produção
    });
  }

  validate(payload: JwtPayload) {
    return { id: payload.sub, email: payload.email };
  }
}
