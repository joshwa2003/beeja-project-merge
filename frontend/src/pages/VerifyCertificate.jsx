import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { verifyCertificate } from '../services/operations/certificateAPI';
import CourseCertificate from '../components/core/Certificate/CourseCertificate';

export default function VerifyCertificate() {
  const { certificateId } = useParams();
  const [certificateData, setCertificateData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const verifyCert = async () => {
      try {
        const data = await verifyCertificate(certificateId);
        setCertificateData({
          courseName: data.courseName,
          studentName: data.studentName,
          email: data.email,
          completionDate: data.completionDate,
          certificateId: data.certificateId
        });
        setLoading(false);
      } catch (error) {
        setError(error.message || "Invalid certificate ID");
        setLoading(false);
      }
    };

    if (certificateId) {
      verifyCert();
    }
  }, [certificateId]);

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-3.5rem)] grid place-items-center">
        <div className="spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[calc(100vh-3.5rem)] grid place-items-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-richblack-5 mb-4">Certificate Verification Failed</h1>
          <p className="text-richblack-100">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8 px-4">
      <h1 className="text-2xl font-bold text-richblack-5 text-center mb-8">
        Certificate Verification Successful
      </h1>
      <div className="max-w-4xl mx-auto">
        <CourseCertificate certificateData={certificateData} />
      </div>
    </div>
  );
}
