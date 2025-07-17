import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://abxqbvvgefgwszrlgviu.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFieHFidnZnZWZnd3N6cmxndml1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3NjY0MzcsImV4cCI6MjA2ODM0MjQzN30.8jEy2PTvvDRj90mzfoqvz8m6fopLA4oOZU_2mxhwfX0'
);

export default function App() {
  const [videos, setVideos] = useState([]);
  const [current, setCurrent] = useState(0);

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

  return (
    <div
      className="w-screen h-screen overflow-hidden relative"
      onWheel={handleScroll}
    >
      {videos.length > 0 ? (
        <video
          key={videos[current].id}
          src={videos[current].video_url}
          className="w-full h-full"
          autoPlay
          controls
          loop
        />
      ) : (
        <p className="text-center mt-20">Video bulunamadı</p>
      )}

      <div className="controls">
        <div className="control-button">❤️</div>
        <div className="control-button">💬</div>
        <div className="control-button">🔗</div>
      </div>
    </div>
  );
}
