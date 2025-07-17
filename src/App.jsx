import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import './index.css';

const supabase = createClient(
  'https://abxqbvvgefgwszrlgviu.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFieHFidnZnZWZnd3N6cmxndml1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3NjY0MzcsImV4cCI6MjA2ODM0MjQzN30.8jEy2PTvvDRj90mzfoqvz8m6fopLA4oOZU_2mxhwfX0'
);

export default function App() {
  const [videos, setVideos] = useState([]);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [current, setCurrent] = useState(0);
  const [likes, setLikes] = useState({});

  useEffect(() => {
    const fetchVideos = async () => {
      const { data } = await supabase
        .from('videos')
        .select('*')
        .order('created_at', { ascending: false });
      setVideos(data || []);
    };
    fetchVideos();
  }, []);

  const handleScroll = (e) => {
    if (e.deltaY > 0 && current < videos.length - 1) {
      setCurrent((prev) => prev + 1);
    } else if (e.deltaY < 0 && current > 0) {
      setCurrent((prev) => prev - 1);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    const ext = file.name.split('.').pop();
    const fileName = `${Date.now()}.${ext}`;
    const filePath = `videos/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('videos')
      .upload(filePath, file);

    if (uploadError) {
      alert('Yükleme hatası');
      console.error(uploadError);
      setUploading(false);
      return;
    }

    const { data: publicUrlData } = supabase.storage
      .from('videos')
      .getPublicUrl(filePath);

    const { error: insertError } = await supabase
      .from('videos')
      .insert([{ video_url: publicUrlData.publicUrl, likes: 0 }]);

    if (insertError) {
      alert('Veritabanı hatası');
      console.error(insertError);
    } else {
      alert('Yükleme başarılı!');
      window.location.reload();
    }
    setUploading(false);
  };

  const handleLike = async (video) => {
    const updatedLikes = (video.likes || 0) + 1;
    await supabase
      .from('videos')
      .update({ likes: updatedLikes })
      .eq('id', video.id);

    setVideos((prev) =>
      prev.map((v) => (v.id === video.id ? { ...v, likes: updatedLikes } : v))
    );
  };

  return (
    <div className="app" onWheel={handleScroll}>
      {videos.length > 0 ? (
        <div className="video-container">
          <video
            key={videos[current].id}
            src={videos[current].video_url}
            className="video"
            autoPlay
            controls
            loop
          />
          <div className="actions">
            <button onClick={() => handleLike(videos[current])}>❤️ {videos[current].likes || 0}</button>
            <button>💬</button>
            <button>🔗</button>
          </div>
        </div>
      ) : (
        <p className="text">Video bulunamadı</p>
      )}

      <div className="upload-box">
        <input type="file" accept="video/*" onChange={(e) => setFile(e.target.files[0])} />
        <button onClick={handleUpload} disabled={uploading}>
          {uploading ? 'Yükleniyor...' : 'Yükle'}
        </button>
      </div>
    </div>
  );
}
