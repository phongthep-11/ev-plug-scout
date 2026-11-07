// Speech Synthesis (Text-to-Speech) & Speech Recognition Service
import { getStationAccessInfo } from '../utils/stationStatus';

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

  getThaiVoice() {
    if (!this.synth) return null;
    const voices = this.synth.getVoices();
    const thaiVoice = voices.find(v => v.lang.includes('th') || v.lang.includes('TH') || v.name.toLowerCase().includes('thai'));
    return thaiVoice || voices[0] || null;
  }

  speak(text, onStart, onEnd) {
    if (!this.synth) {
      console.warn('SpeechSynthesis not supported');
      if (onStart) onStart();
      if (onEnd) setTimeout(onEnd, 2000);
      return;
    }

    this.synth.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'th-TH';
    utterance.rate = 1.05;
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

  generateAnswer(query, stations) {
    const q = (query || '').toLowerCase().trim();
    const nextStation = stations.find(s => s.isNextOnRoute) || stations[0];
    const nextAccess = getStationAccessInfo(nextStation);

    // Case 0: Ask about Booking / Walk-in / Nobody there
    if (q.includes('จอง') || q.includes('เข้าได้เลย') || q.includes('มีคนไหม') || q.includes('โล่ง')) {
      const walkInStations = stations.filter(s => s.availablePlugs > 0 && getStationAccessInfo(s).isPureWalkIn);
      const emptyStations = stations.filter(s => getStationAccessInfo(s).occupancyState === 'EMPTY_ALL_FREE');
      const target = walkInStations[0] || emptyStations[0] || nextStation;
      const tAccess = getStationAccessInfo(target);
      return {
        text: `สถานี ${target.name} ห่างไป ${target.distanceKm || 'ไม่กี่'} กิโลเมตร ตอนนี้${tAccess.occupancyBadgeText} และ${tAccess.bookingShortBadge} พี่นิคสามารถขับเข้าไปเสียบสายชาร์จได้เลยครับ`,
        targetStation: target
      };
    }

    // Case: Inquire about user's car (Jaecoo 5 EV Ultra)
    if (q.includes('รถฉัน') || q.includes('jaecoo') || q.includes('แจกู') || q.includes('สเปก') || q.includes('เหมาะกับ')) {
      return {
        text: `รถ JAECOO 5 EV Ultra ของพี่นิค แบตเตอรี่ 67 กิโลวัตต์ชั่วโมง รองรับหัวจ่าย CCS2 ความเร็ว DC สูงสุด 130 kW ครับ สามารถแวะชาร์จที่สถานีข้างหน้า ${nextStation.name} ซึ่ง${nextAccess.occupancyBadgeText} และ${nextAccess.bookingShortBadge} ได้ทันทีครับ`,
        targetStation: nextStation
      };
    }

    // Case: Search by City or Province
    const majorLocations = [
      { key: 'เชียงใหม่', label: 'เชียงใหม่' },
      { key: 'พัทยา', label: 'พัทยา' },
      { key: 'โคราช', label: 'นครราชสีมา' },
      { key: 'ขอนแก่น', label: 'ขอนแก่น' },
      { key: 'หัวหิน', label: 'หัวหิน' },
      { key: 'ภูเก็ต', label: 'ภูเก็ต' },
      { key: 'บางนา', label: 'บางนา' },
      { key: 'อยุธยา', label: 'อยุธยา' },
      { key: 'ชะอำ', label: 'ชะอำ' },
      { key: 'ระยอง', label: 'ระยอง' },
      { key: 'สุราษฎร์', label: 'สุราษฎร์ธานี' }
    ];
    for (const loc of majorLocations) {
      if (q.includes(loc.key)) {
        const found = stations.find(s => (s.name || '').includes(loc.label) || (s.address || '').includes(loc.label) || (s.province || '').includes(loc.label));
        if (found) {
          const fAccess = getStationAccessInfo(found);
          return {
            text: `พบสถานีชาร์จในพื้นที่ ${loc.label} คือ ${found.name} ตอนนี้${fAccess.occupancyBadgeText} ${fAccess.bookingShortBadge} กำลังไฟ ${found.power} ครับ`,
            targetStation: found
          };
        }
      }
    }

    // Case 1: Ultra Fast chargers
    if (q.includes('ultra') || q.includes('เร็วสุด') || q.includes('360')) {
      const ultra = stations.find(s => s.powerKw >= 300);
      if (ultra) {
        const uAccess = getStationAccessInfo(ultra);
        return {
          text: `สถานีที่ชาร์จเร็วที่สุดคือ ${ultra.name} ระยะทางอีก ${ultra.distanceKm} กิโลเมตร มีหัวชาร์จ 360 kW ตอนนี้${uAccess.occupancyBadgeText} ${uAccess.bookingShortBadge} ครับ`,
          targetStation: ultra
        };
      }
    }

    // Case 2: Inquire about next station or front station
    if (q.includes('ข้างหน้า') || q.includes('ถัดไป') || q.includes('ว่างไหม') || q.includes('ปั๊มหน้า') || !q) {
      if (nextStation.availablePlugs > 0) {
        return {
          text: `สถานีถัดไปคือ ${nextStation.name} อีก ${nextStation.distanceKm} กิโลเมตร ตอนนี้${nextAccess.occupancyBadgeText} กำลังไฟ ${nextStation.power} ${nextAccess.bookingShortBadge} สามารถเลี้ยวเข้าชาร์จได้เลยครับ`,
          targetStation: nextStation
        };
      } else {
        const altStation = stations.find(s => s.id !== nextStation.id && s.availablePlugs > 0);
        const altAccess = getStationAccessInfo(altStation);
        const altText = altStation 
          ? `แนะนำขับเลยไปที่ ${altStation.name} ตอนนี้${altAccess.occupancyBadgeText} และ${altAccess.bookingShortBadge} ครับ`
          : 'ขณะนี้สถานีข้างเคียงมีคิวหนาแน่นเช่นกันครับ';

        return {
          text: `แจ้งเตือนครับ สถานีข้างหน้า ${nextStation.name} อีก ${nextStation.distanceKm} กิโลเมตร มีคนชาร์จเต็มทุกหัวและมีคิวรอ ${nextStation.waitingQueue || 1} คันครับ ${altText}`,
          targetStation: nextStation
        };
      }
    }

    // Case 3: Nearest available station
    if (q.includes('ใกล้สุด') || q.includes('หาตู้ว่าง')) {
      const available = stations.filter(s => s.availablePlugs > 0).sort((a, b) => a.distanceKm - b.distanceKm)[0];
      if (available) {
        const aAccess = getStationAccessInfo(available);
        return {
          text: `สถานีที่มีตู้ว่างที่ใกล้ที่สุดคือ ${available.name} ระยะทาง ${available.distanceKm} กิโลเมตร ตอนนี้${aAccess.occupancyBadgeText} ${aAccess.bookingShortBadge} ครับ`,
          targetStation: available
        };
      }
    }

    // Default response
    return {
      text: `ขณะนี้สถานีข้างหน้า ${nextStation.name} ห่างไป ${nextStation.distanceKm} กิโลเมตร ${nextAccess.occupancyBadgeText} ${nextAccess.bookingShortBadge} ครับ`,
      targetStation: nextStation
    };
  }
}

export const speechService = new SpeechService();
