import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import InterviewClient from "@/components/interview/interview-client";

export default async function InterviewPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  const job = await prisma.job.findUnique({
    where: { interviewLink: token },
    select: {
      id: true,
      title: true,
      status: true,
      createdBy: { select: { company: true } },
    },
  });

  if (!job || job.status !== "ACTIVE") {
    notFound();
  }

  return (
    <InterviewClient
      token={token}
      jobTitle={job.title}
      company={job.createdBy.company || "the company"}
    />
  );
}
