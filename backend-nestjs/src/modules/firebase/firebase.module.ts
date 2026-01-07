import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { FirebaseService } from './firebase.service';
import { FirebaseAuthService } from './firebase-auth.service';
import { FirestoreService } from './firestore.service';
import { FirebaseController } from './firebase.controller';

@Global()
@Module({
  imports: [ConfigModule],
  controllers: [FirebaseController],
  providers: [FirebaseService, FirebaseAuthService, FirestoreService],
  exports: [FirebaseService, FirebaseAuthService, FirestoreService],
})
export class FirebaseModule {}

