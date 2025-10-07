import { Dimensions } from 'react-native';

// Get actual device width and height
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Reference device dimensions (your design base)
const BASE_WIDTH = 393; // reference width from design
const BASE_HEIGHT = 852; // reference height from design

// Width scaling function
const rawWidth = px => (SCREEN_WIDTH / BASE_WIDTH) * px;

// Height scaling function
const rawHeight = px => (SCREEN_HEIGHT / BASE_HEIGHT) * px;

// Font scaling function
const rawFont = px =>
  Math.round(
    ((SCREEN_WIDTH / BASE_WIDTH + SCREEN_HEIGHT / BASE_HEIGHT) / 2) * px,
  );

export const CommonWidths = {
  width2: rawWidth(2),
  width4: rawWidth(4),
  width6: rawWidth(6),
  width8: rawWidth(8),
  width10: rawWidth(10),
  width12: rawWidth(12),
  width14: rawWidth(14),
  width16: rawWidth(16),
  width18: rawWidth(18),
  width20: rawWidth(20),
  width22: rawWidth(22),
  width24: rawWidth(24),
  width26: rawWidth(26),
  width28: rawWidth(28),
  width30: rawWidth(30),
  width50: rawWidth(50),
  width100: rawWidth(100),
};

export const CommonHeights = {
  height2: rawHeight(2),
  height4: rawHeight(4),
  height6: rawHeight(6),
  height8: rawHeight(8),
  height10: rawHeight(10),
  height12: rawHeight(12),
  height14: rawHeight(14),
  height16: rawHeight(16),
  height18: rawHeight(18),
  height20: rawHeight(20),
  height22: rawHeight(22),
  height24: rawHeight(24),
  height26: rawHeight(26),
  height28: rawHeight(28),
  height30: rawHeight(30),
  height50: rawHeight(50),
  height60: rawHeight(60),
  height80: rawHeight(80),
  height90: rawHeight(90),
  height100: rawHeight(100),
  height120: rawHeight(120),
};

export const CommonFonts = {
  font8: rawFont(8),
  font10: rawFont(10),
  font12: rawFont(12),
  font14: rawFont(14),
  font16: rawFont(16),
  font18: rawFont(18),
  font20: rawFont(20),
  font22: rawFont(22),
  font24: rawFont(24),
  font26: rawFont(26),
  font28: rawFont(28),
  font30: rawFont(30),
};

export { rawWidth, rawHeight, rawFont };