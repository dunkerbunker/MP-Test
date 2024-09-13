'use client';

import RecommendationForm from "../../components/RecommendationForm";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";

export default function EditPage() {
  const params = useParams();
  const idParam = params?.id;
  const id = Array.isArray(idParam) ? idParam[0] : idParam;
  const router = useRouter();

  useEffect(() => {
    if (!id) {
      // Redirect to home page or show an error
      router.push("/");
    }
  }, [id, router]);

  if (!id) {
    return <div>Loading...</div>;// or a loading indicator
  }

  return <RecommendationForm isEdit={true} id={id} />;
}
