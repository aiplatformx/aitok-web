import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://abxqbvvgefgwszrlgviu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFieHFidnZnZWZnd3N6cmxndml1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3NjY0MzcsImV4cCI6MjA2ODM0MjQzN30.8jEy2PTvvDRj90mzfoqvz8m6fopLA4oOZU_2mxhwfX0';
const supabase = createClient(supabaseUrl, supabaseKey);

export default function Home() {
  const [videos, setVideos] = useState([]);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const fetchVideos = async () => {
      const { data, error } = await supabase
        .from('videos')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) console.error(error);
      else setVideos(data);
    };
    fetchVideos();
  }, []);

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `videos/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('videos')
      .upload(filePath, file);

    if (uploadError) {
      console.error('Upload error:', uploadError);
      setUploading(false);
      return;
    }

    const { data: publicUrlData } = supabase.storage
      .from('videos')
      .getPublicUrl(filePath);

    const { error: insertError } = await supabase
      .from('videos')
      .insert([{ video_url: publicUrlData.publicUrl }]);

    if (insertError) {
      console.error('DB insert error:', insertError);
    } else {
      alert('Video yüklendi!');
      window.location.reload();
    }
    setUploading(false);
  };

  return (
    <div className="w-full min-h-screen bg-black text-white p-4">
      <h1 className="text-xl font-bold mb-4">AItok - Video Yükle</h1>
      <input
        type="file"
        accept="video/*"
        onChange={(e) => setFile(e.target.files[0])}
        className="mb-2"
      />
      <button
        onClick={handleUpload}
        disabled={uploading}
        className="bg-white text-black px-4 py-2 rounded"
      >
        {uploading ? 'Yükleniyor...' : 'Videoyu Yükle'}
      </button>

      <div className="mt-10">
        {videos.map((video, index) => (
          <div key={index} className="w-full my-4">
            <video
              className="w-full max-h-[500px] mx-auto"
              src={video.video_url}
              controls
              autoPlay
              loop
            />
          </div>
        ))}
        {videos.length === 0 && (
          <p>Yüklenmiş video bulunamadı.</p>
        )}
      </div>
    </div>
  );
}
