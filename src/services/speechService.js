// Speech Synthesis (Text-to-Speech) & Speech Recognition Service

class SpeechService {
  constructor() {
    this.synth = typeof window !== 'undefined' ? window.speechSynthesis : null;
    this.isSpeaking = false;
    this.recognition = null;
    this.initRecognition();
  }

  initRecognition() {
    if (typeof window === 'undefined') return;
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      try {
        this.recognition = new SpeechRecognition();
        this.recognition.lang = 'th-TH';
        this.recognition.continuous = false;
        this.recognition.interimResults = false;
      } catch (err) {
        console.warn('SpeechRecognition initialization error:', err);
      }
    }
  }

  // Get best available Thai voice
  getThaiVoice() {
    if (!this.synth) return null;
    const voices = this.synth.getVoices();
    // Prioritize Thai voices
    const thaiVoice = voices.find(v => v.lang.includes('th') || v.lang.includes('TH') || v.name.toLowerCase().includes('thai'));
    return thaiVoice || voices[0] || null;
  }

  // Speak Thai text out loud
  speak(text, onStart, onEnd) {
    if (!this.synth) {
      console.warn('SpeechSynthesis not supported');
      if (onStart) onStart();
      if (onEnd) setTimeout(onEnd, 2000);
      return;
    }

    // Cancel any previous speaking
    this.synth.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'th-TH';
    utterance.rate = 1.05; // Slightly faster for automotive driving responsiveness
    utterance.pitch = 1.0;

    const voice = this.getThaiVoice();
    if (voice) {
      utterance.voice = voice;
    }

    utterance.onstart = () => {
      this.isSpeaking = true;
      if (onStart) onStart();
    };

    utterance.onend = () => {
      this.isSpeaking = false;
      if (onEnd) onEnd();
    };

    utterance.onerror = (e) => {
      console.warn('TTS error:', e);
      this.isSpeaking = false;
      if (onEnd) onEnd();
    };

    this.synth.speak(utterance);
  }

  stop() {
    if (this.synth) {
      this.synth.cancel();
      this.isSpeaking = false;
    }
    if (this.recognition) {
      try {
        this.recognition.abort();
      } catch (e) {
        // ignore
      }
    }
  }

  // Start listening via microphone
  listen({ onResult, onError, onStart, onEnd }) {
    if (!this.recognition) {
      if (onError) onError('เบราว์เซอร์ไม่รองรับ Speech Recognition หรือยังไม่อนุญาตไมโครโฟน');
      return;
    }

    this.recognition.onstart = () => {
      if (onStart) onStart();
    };

    this.recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      if (onResult) onResult(transcript);
    };

    this.recognition.onerror = (event) => {
      if (onError) onError(event.error || 'เกิดข้อผิดพลาดในการฟังเสียง');
    };

    this.recognition.onend = () => {
      if (onEnd) onEnd();
    };

    try {
      this.recognition.start();
    } catch (e) {
      console.warn('Recognition start failed:', e);
      if (onError) onError(e.message);
    }
  }

  // Resolve user query and generate smart voice answer based on current stations
  generateAnswer(query, stations) {
    const q = (query || '').toLowerCase().trim();
    const nextStation = stations.find(s => s.isNextOnRoute) || stations[0];

    // Case: Inquire about user's car (Jaecoo 5 EV Ultra)
    if (q.includes('รถฉัน') || q.includes('jaecoo') || q.includes('แจกู') || q.includes('สเปก') || q.includes('เหมาะกับ')) {
      return {
        text: `รถ JAECOO 5 EV Ultra ของพี่นิค แบตเตอรี่ 67 กิโลวัตต์ชั่วโมง รองรับหัวจ่าย CCS2 ความเร็ว DC สูงสุด 130 kW ครับ สามารถแวะชาร์จที่สถานีข้างหน้า ${nextStation.name} ซึ่งมีตู้ ${nextStation.power} ได้เต็มกำลังสปีด ชาร์จ 30 ถึง 80% ใช้เวลาเพียง 28 นาทีครับ`,
        targetStation: nextStation
      };
    }

    // Case 1: Ultra Fast chargers
    if (q.includes('ultra') || q.includes('เร็วสุด') || q.includes('360')) {
      const ultra = stations.find(s => s.powerKw >= 300);
      if (ultra) {
        return {
          text: `สถานีที่ชาร์จเร็วที่สุดคือ ${ultra.name} ระยะทางอีก ${ultra.distanceKm} กิโลเมตร มีหัวชาร์จ 360 kW กำลังว่าง ${ultra.availablePlugs} จาก ${ultra.totalPlugs} หัวจ่ายครับ`,
          targetStation: ultra
        };
      }
    }

    // Case 2: Inquire about next station or front station
    if (q.includes('ข้างหน้า') || q.includes('ถัดไป') || q.includes('ว่างไหม') || q.includes('ปั๊มหน้า') || !q) {
      if (nextStation.availablePlugs > 0) {
        return {
          text: `สถานีถัดไปคือ ${nextStation.name} อีก ${nextStation.distanceKm} กิโลเมตร ตอนนี้มีตู้ว่าง ${nextStation.availablePlugs} จาก ${nextStation.totalPlugs} หัวจ่าย กำลังไฟ ${nextStation.power} ครับ ไม่ต้องรอคิว สามารถแวะชาร์จได้เลยครับ`,
          targetStation: nextStation
        };
      } else {
        // Next station is full! Find alternative
        const altStation = stations.find(s => s.id !== nextStation.id && s.availablePlugs > 0);
        const altText = altStation 
          ? `แนะนำขับเลยไปอีก ${Math.round((altStation.distanceKm - nextStation.distanceKm) * 10) / 10} กิโลเมตร ที่ ${altStation.name} มีตู้ว่าง ${altStation.availablePlugs} หัวครับ`
          : 'ขณะนี้สถานีข้างเคียงมีคิวหนาแน่นเช่นกันครับ';

        return {
          text: `แจ้งเตือนครับ สถานีข้างหน้า ${nextStation.name} อีก ${nextStation.distanceKm} กิโลเมตร ตู้ชาร์จเต็มทั้งหมดและมีคิวรอ ${nextStation.waitingQueue || 1} คันครับ ${altText}`,
          targetStation: nextStation
        };
      }
    }

    // Case 3: Nearest available station
    if (q.includes('ใกล้สุด') || q.includes('หาตู้ว่าง')) {
      const available = stations.filter(s => s.availablePlugs > 0).sort((a, b) => a.distanceKm - b.distanceKm)[0];
      if (available) {
        return {
          text: `สถานีที่มีตู้ว่างที่ใกล้ที่สุดคือ ${available.name} ระยะทาง ${available.distanceKm} กิโลเมตร ใช้เวลาเดินทาง ${available.travelTime} มีตู้ว่าง ${available.availablePlugs} หัวจ่ายครับ`,
          targetStation: available
        };
      }
    }

    // Case 4: Brand specific
    if (q.includes('pea') || q.includes('วอลต้า')) {
      const pea = stations.find(s => s.provider === 'PEA VOLTA');
      return {
        text: `สถานี PEA VOLTA ที่ใกล้ที่สุดคือ ${pea.name} อีก ${pea.distanceKm} กิโลเมตร ว่าง ${pea.availablePlugs} จาก ${pea.totalPlugs} หัวจ่ายครับ`,
        targetStation: pea
      };
    }

    // Default response
    return {
      text: `ขณะนี้สถานีข้างหน้า ${nextStation.name} ห่างไป ${nextStation.distanceKm} กิโลเมตร มีตู้ชาร์จว่าง ${nextStation.availablePlugs} จาก ${nextStation.totalPlugs} หัวจ่ายครับ`,
      targetStation: nextStation
    };
  }
}

export const speechService = new SpeechService();

