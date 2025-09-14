import React, { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";

// --- DATA ARRAYS ---
const hours = Array.from({ length: 12 }, (_, i) => (i + 1).toString());
const minutes = Array.from({ length: 60 }, (_, i) =>
  i.toString().padStart(2, "0")
);
const periods = ["AM", "PM"];

// --- HELPER HOOKS ---

/**
 * Custom hook to handle the infinite scroll illusion.
 * It listens for scroll events and silently jumps the scroll position
 * when the user reaches the padded buffer zones at the top or bottom.
 */
const useInfiniteScroll = (ref, items) => {
  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    let scrollTimeout;
    const handleScroll = () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        const itemHeight = element.scrollHeight / element.children.length;
        const bufferSize = 2; // We have 2 items as padding top and bottom
        const bufferHeight = bufferSize * itemHeight;
        const contentHeight = items.length * itemHeight;

        if (element.scrollTop < bufferHeight) {
          element.scrollTop = contentHeight + element.scrollTop;
        } else if (element.scrollTop >= bufferHeight + contentHeight) {
          element.scrollTop = element.scrollTop - contentHeight;
        }
      }, 150); // Debounce to run only after scrolling stops
    };

    element.addEventListener("scroll", handleScroll, { passive: true });
    return () => element.removeEventListener("scroll", handleScroll);
  }, [ref, items]);
};

/**
 * Custom hook to detect the centered item using IntersectionObserver.
 * This is the most reliable way to set the state.
 */
const useSnapScroll = (scrollRef, setter) => {
  useEffect(() => {
    const scrollElement = scrollRef.current;
    if (!scrollElement) return;

    const observerCallback = (entries) => {
      const intersectingEntry = entries.find((e) => e.isIntersecting);
      if (intersectingEntry) {
        const value = intersectingEntry.target.dataset.value;
        if (value) setter(value);
      }
    };
    const observer = new IntersectionObserver(observerCallback, {
      root: scrollElement,
      rootMargin: "-50% 0px -50% 0px",
    });

    Array.from(scrollElement.children).forEach((child) =>
      observer.observe(child)
    );
    return () => observer.disconnect();
  }, [scrollRef, setter]);
};

// --- MAIN COMPONENT ---
const TimePicker = ({ isOpen, onClose, onConfirm, initialTime }) => {
  const [selectedHour, setSelectedHour] = useState("9");
  const [selectedMinute, setSelectedMinute] = useState("00");
  const [selectedPeriod, setSelectedPeriod] = useState("AM");

  const prevHourRef = useRef(selectedHour);
  const hourRef = useRef(null);
  const minuteRef = useRef(null);
  const periodRef = useRef(null);

  // Create padded arrays for the infinite scroll effect
  const paddedHours = [...hours.slice(-2), ...hours, ...hours.slice(0, 2)];
  const paddedMinutes = [
    ...minutes.slice(-2),
    ...minutes,
    ...minutes.slice(0, 2),
  ];

  // Apply all the logic hooks
  useSnapScroll(hourRef, setSelectedHour);
  useSnapScroll(minuteRef, setSelectedMinute);
  useSnapScroll(periodRef, setSelectedPeriod);
  useInfiniteScroll(hourRef, hours);
  useInfiniteScroll(minuteRef, minutes);

  // Effect to automatically toggle AM/PM when scrolling past 12
  useEffect(() => {
    const prevHour = parseInt(prevHourRef.current, 10);
    const currentHour = parseInt(selectedHour, 10);
    if (
      (prevHour === 11 && currentHour === 12) ||
      (prevHour === 12 && currentHour === 11)
    ) {
      setSelectedPeriod((p) => (p === "AM" ? "PM" : "AM"));
    }
    prevHourRef.current = selectedHour;
  }, [selectedHour]);

  // Effect to set initial scroll positions
  useEffect(() => {
    if (isOpen) {
      let initialH = "9",
        initialM = "00",
        initialP = "AM";
      if (initialTime) {
        const [time, period] = initialTime.split(" ");
        const [h, m] = time.split(":");
        initialH = parseInt(h, 10).toString();
        initialM = m;
        initialP = period;
      }

      setSelectedHour(initialH);
      setSelectedMinute(initialM);
      setSelectedPeriod(initialP);

      setTimeout(() => {
        const scrollToValue = (ref, items, value, paddedItems) => {
          const el = ref.current;
          if (!el || !value) return;
          const itemIndex = items.indexOf(value);
          const itemHeight = el.scrollHeight / paddedItems.length;
          el.scrollTop = (itemIndex + 2) * itemHeight;
        };
        scrollToValue(hourRef, hours, initialH, paddedHours);
        scrollToValue(minuteRef, minutes, initialM, paddedMinutes);
        scrollToValue(
          periodRef,
          periods,
          initialP,
          ["", ""].concat(periods).concat(["", ""])
        );
      }, 0);
    }
  }, [isOpen, initialTime]);

  const handleConfirm = () => {
    onConfirm(
      `${selectedHour.padStart(2, "0")}:${selectedMinute} ${selectedPeriod}`
    );
    onClose();
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="time-picker-overlay" onMouseDown={onClose}>
      <div
        className="time-picker-container"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="time-picker-header">Select a Time</div>
        <div className="time-picker-body">
          <div className="time-picker-highlight"></div>

          <div ref={hourRef} className="time-picker-column">
            {paddedHours.map((hour, index) => (
              <div
                key={`h-${index}`}
                data-value={hour}
                className={`time-picker-item ${
                  selectedHour === hour ? "is-selected" : ""
                }`}
              >
                {hour}
              </div>
            ))}
          </div>

          <div className="time-picker-colon">:</div>

          <div ref={minuteRef} className="time-picker-column">
            {paddedMinutes.map((minute, index) => (
              <div
                key={`m-${index}`}
                data-value={minute}
                className={`time-picker-item ${
                  selectedMinute === minute ? "is-selected" : ""
                }`}
              >
                {minute}
              </div>
            ))}
          </div>

          <div ref={periodRef} className="time-picker-column period-column">
            {["", ""]
              .concat(periods)
              .concat(["", ""])
              .map((period, index) => (
                <div
                  key={`p-${index}`}
                  data-value={period}
                  className={`time-picker-item ${
                    selectedPeriod === period ? "is-selected" : ""
                  }`}
                >
                  {period}
                </div>
              ))}
          </div>
        </div>
        <div className="time-picker-footer">
          <button onClick={onClose} className="time-picker-btn cancel">
            Cancel
          </button>
          <button onClick={handleConfirm} className="time-picker-btn confirm">
            OK
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default TimePicker;
