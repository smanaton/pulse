/**
 * Unit Test - Pure Functions
 * Tests business logic without side effects
 * Fast, deterministic, isolated
 */

import { describe, expect, test } from "vitest";

// Example utility functions that would be in your codebase
export const formatRelativeDate = (date: Date, now: Date = new Date()): string => {
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffHours < 1) return "just now";
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
};

export const isValidIdeaTitle = (title: string): boolean => {
  return title.trim().length >= 3 && title.length <= 200;
};

export const calculateReadingTime = (content: string): number => {
  const wordsPerMinute = 200;
  const words = content.trim().split(/\s+/).length;
  return Math.ceil(words / wordsPerMinute);
};

describe("Date Helpers", () => {
  describe("formatRelativeDate", () => {
    test("Given_DateJustNow_When_Formatted_Then_ReturnsJustNow", () => {
      // Arrange
      const now = new Date("2024-01-01T12:00:00Z");
      const recent = new Date("2024-01-01T11:59:30Z"); // 30 seconds ago

      // Act
      const result = formatRelativeDate(recent, now);

      // Assert
      expect(result).toBe("just now");
    });

    test("Given_DateHoursAgo_When_Formatted_Then_ReturnsHoursAgo", () => {
      // Arrange
      const now = new Date("2024-01-01T12:00:00Z");
      const hoursAgo = new Date("2024-01-01T08:00:00Z"); // 4 hours ago

      // Act
      const result = formatRelativeDate(hoursAgo, now);

      // Assert
      expect(result).toBe("4h ago");
    });

    test("Given_DateDaysAgo_When_Formatted_Then_ReturnsDaysAgo", () => {
      // Arrange
      const now = new Date("2024-01-05T12:00:00Z");
      const daysAgo = new Date("2024-01-03T12:00:00Z"); // 2 days ago

      // Act
      const result = formatRelativeDate(daysAgo, now);

      // Assert
      expect(result).toBe("2d ago");
    });

    test("Given_DateWeeksAgo_When_Formatted_Then_ReturnsLocaleDateString", () => {
      // Arrange
      const now = new Date("2024-01-15T12:00:00Z");
      const weeksAgo = new Date("2024-01-01T12:00:00Z"); // 2 weeks ago

      // Act
      const result = formatRelativeDate(weeksAgo, now);

      // Assert - locale specific, just check it's a date string
      expect(result).toMatch(/^\d{1,2}\/\d{1,2}\/\d{4}$/);
    });
  });
});

describe("Idea Validation", () => {
  describe("isValidIdeaTitle", () => {
    test("Given_ValidTitle_When_Validated_Then_ReturnsTrue", () => {
      // Act & Assert
      expect(isValidIdeaTitle("Valid Idea Title")).toBe(true);
      expect(isValidIdeaTitle("ABC")).toBe(true); // Minimum length
    });

    test("Given_TooShortTitle_When_Validated_Then_ReturnsFalse", () => {
      // Act & Assert
      expect(isValidIdeaTitle("AB")).toBe(false);
      expect(isValidIdeaTitle("  ")).toBe(false); // Only whitespace
      expect(isValidIdeaTitle("")).toBe(false); // Empty
    });

    test("Given_TooLongTitle_When_Validated_Then_ReturnsFalse", () => {
      // Arrange
      const tooLong = "A".repeat(201);

      // Act & Assert
      expect(isValidIdeaTitle(tooLong)).toBe(false);
    });

    test("Given_TitleWithWhitespace_When_Validated_Then_TrimsAndValidates", () => {
      // Act & Assert
      expect(isValidIdeaTitle("  Valid Title  ")).toBe(true);
      expect(isValidIdeaTitle("  AB  ")).toBe(false); // Too short after trim
    });
  });
});

describe("Reading Time Calculator", () => {
  describe("calculateReadingTime", () => {
    test("Given_ShortContent_When_Calculated_Then_ReturnsMinimumOneMinute", () => {
      // Arrange
      const shortContent = "Just a few words here.";

      // Act
      const result = calculateReadingTime(shortContent);

      // Assert
      expect(result).toBe(1);
    });

    test("Given_LongContent_When_Calculated_Then_ReturnsCorrectMinutes", () => {
      // Arrange - Create content with exactly 400 words (should be 2 minutes at 200 wpm)
      const words = new Array(400).fill("word").join(" ");

      // Act
      const result = calculateReadingTime(words);

      // Assert
      expect(result).toBe(2);
    });

    test("Given_EmptyContent_When_Calculated_Then_ReturnsOne", () => {
      // Act & Assert
      expect(calculateReadingTime("")).toBe(1);
      expect(calculateReadingTime("   ")).toBe(1);
    });
  });
});