import facilityImage from '../../assets/facility.jpg';
import stadiumImage from '../../assets/Stadium.jpg';
import teamImage from '../../assets/Team.jpg';
import eventImage from '../../assets/Event.jpg';
import equipmentImage from '../../assets/equipment.jpg';

export const TIME_SLOTS = [
  { start: '06:00', end: '08:00' },
  { start: '08:00', end: '10:00' },
  { start: '10:00', end: '12:00' },
  { start: '12:00', end: '14:00' },
  { start: '14:00', end: '16:00' },
  { start: '16:00', end: '18:00' },
  { start: '18:00', end: '20:00' },
];

const SPORT_META = {
  Cricket: { icon: '🏏', image: stadiumImage },
  Volleyball: { icon: '🏐', image: teamImage },
  Netball: { icon: '🏀', image: facilityImage },
  Basketball: { icon: '🏀', image: eventImage },
  Badminton: { icon: '🏸', image: equipmentImage },
  Tennis: { icon: '🎾', image: facilityImage },
  Football: { icon: '⚽', image: stadiumImage },
  'Swimming Pool': { icon: '🏊', image: facilityImage },
};

export const getSportMeta = (sportType = '') => {
  const fallback = { icon: '🎯', image: facilityImage };
  return SPORT_META[sportType] || fallback;
};

export const toMinutes = (time) => {
  const [hours, minutes] = String(time).split(':').map(Number);
  return (hours * 60) + minutes;
};

export const rangesOverlap = (aStart, aEnd, bStart, bEnd) => {
  return toMinutes(aStart) < toMinutes(bEnd) && toMinutes(aEnd) > toMinutes(bStart);
};
