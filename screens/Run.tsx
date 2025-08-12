import React, { useState, useRef, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RunControls } from '../components/RunControls';

export const Run: React.FC = () => {
  const [status, setStatus] = useState<'idle' | 'running' | 'paused'>('idle');
  const [elapsed, setElapsed] = useState(0);
  const timer = useRef<NodeJS.Timer | null>(null);

  useEffect(() => {
    if (status === 'running') {
      timer.current = setInterval(() => setElapsed((e) => e + 1), 1000);
    } else if (timer.current) {
      clearInterval(timer.current);
      timer.current = null;
    }
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [status]);

  return (
    <SafeAreaView className="flex-1 bg-surface">
      <RunControls
        status={status}
        elapsedSec={elapsed}
        distanceKm={0}
        pace={0}
        onStart={() => setStatus('running')}
        onPause={() => setStatus('paused')}
        onResume={() => setStatus('running')}
        onEnd={() => {
          setStatus('idle');
          setElapsed(0);
        }}
      />
    </SafeAreaView>
  );
};
