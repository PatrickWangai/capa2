-- AddForeignKey
ALTER TABLE "CirclePost" ADD CONSTRAINT "CirclePost_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
