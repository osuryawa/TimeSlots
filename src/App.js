import React, { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [data, setData] = useState(null);
  const [visibleCardCount, setVisibleCardCount] = useState(9);
  const [selectedCard, setSelectedCard] = useState(null);
  const [availableSlots, setAvailableSlots] = useState(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  const [finalID, setFinalID] = useState(null);
  const [avaialbleTimeDataObj, setAvaialbleTimeDataObj] = useState(null);

  const currentDate = new Date().toISOString().slice(0, 10);

  const doctorID = { doctor_id: 2 };

  useEffect(() => {
    fetch(
      "https://aartas-qaapp-as.azurewebsites.net/aartas_uat/public/api/doctor",
      {
        method: "post",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(doctorID),
      }
    )
      .then((resp) => resp.json())
      .then((responseData) => {
        setData(responseData.data[0]);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        setData({ error: "Error fetching data" });
      });
  }, []);

  const availableDates = data && data.timeslots.map((obj) => obj.date);
  const uniqueDates = [...new Set(availableDates)];

  const formattedDates = uniqueDates.reduce((acc, currentDate) => {
    let date = new Date(currentDate);
    let days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    let months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    let dayName = days[date.getDay()];
    let monthName = months[date.getMonth()];
    let dayNumber = date.getDate();

    let formattedDate = `${dayName}, ${monthName} ${dayNumber}`;

    if (!acc.hasOwnProperty(currentDate)) {
      acc[currentDate] = formattedDate;
    }

    return acc;
  }, {});

  function convertTimeTo24HoursFormat(timeString) {
    const [time, modifier] = timeString.split(/(AM|PM)/);
    let [hours, minutes] = time.split(":");

    if (hours === "12") {
      hours = "00";
    }

    if (modifier === "PM") {
      hours = String(parseInt(hours, 10) + 12);
    }

    return `${hours.length === 1 ? "0" + hours : hours}:${minutes}:${"00"}`;
  }

  const filterDates = Object.keys(formattedDates);

  const handleLoadMore = () => {
    setVisibleCardCount((prevCount) => prevCount + 10);
  };

  const handleCardClick = (date) => {
    setSelectedCard(date);
  };

  useEffect(() => {
    const availableTimeObj =
      data && data.timeslots.filter((obj) => obj.date == selectedCard);
    const availableTimes =
      data &&
      data.timeslots
        .filter((obj) => obj.date == selectedCard)
        .map((obj) => obj.time_from);
    setAvaialbleTimeDataObj(availableTimeObj);
    setAvailableSlots(availableTimes);
  }, [selectedTimeSlot, selectedCard]);

  useEffect(() => {
    const objID =
      avaialbleTimeDataObj &&
      avaialbleTimeDataObj.find((obj) => obj.time_from == selectedTimeSlot);
    setFinalID(objID && objID.id);
  }, [selectedTimeSlot, selectedCard]);

  const formattedTimeArray =
    availableSlots &&
    availableSlots.map((timeStr) => {
      const time = new Date(`2000-01-01T${timeStr}`);
      const formattedTime = time.toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
      });
      return formattedTime.replace(/\s/g, ""); // Remove spaces between time and AM/PM
    });

  let slotObject = {};

  slotObject =
    availableSlots &&
    formattedTimeArray &&
    availableSlots.map(
      (index) => (availableSlots[index] = formattedTimeArray[index])
    );

  const handleTimeSlotClick = (time) => {
    setSelectedTimeSlot(convertTimeTo24HoursFormat(time));
  };
  const renderTimeSlots = () => {
    let slotsCountText = "";
    if (!selectedCard) {
      return <p>Please select a date to see available slots.</p>;
    }

    if (!availableSlots || availableSlots.length === 0) {
      return <p>No available slots for this date.</p>;
    }

    if (availableSlots && availableSlots.length > 0) {
      slotsCountText = `${availableSlots.length} slot${
        availableSlots.length !== 1 ? "s" : ""
      } available`;
    }

    return (
      <div className="time-slots-container">
        <h2 className="headline">Select Slots</h2>
        <span className="available-slots">{slotsCountText}</span>
        <div className="container">
          {formattedTimeArray.map((time, index) => (
            <div
              key={index}
              className={`card time-slot ${
                selectedTimeSlot === convertTimeTo24HoursFormat(time)
                  ? "selected"
                  : ""
              }`}
              onClick={() => handleTimeSlotClick(time)}
            >
              <h3>{time}</h3>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderFinalID = () => {
    if (finalID) {
      return (
        <div className="final-id">
          <p>Selected Slot ID: {finalID}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="App">
      <h2 className="headline">Select Date</h2>
      <div className="container">
        {filterDates.slice(0, visibleCardCount).map((date, index) => (
          <div key={date}>
            <div
              className={`card ${date === currentDate ? "today" : ""} ${
                selectedCard === date ? "selected" : ""
              }`}
              onClick={() => handleCardClick(date)}
            >
              <h3>{date === currentDate ? "Today" : formattedDates[date]}</h3>
            </div>
          </div>
        ))}
        {visibleCardCount < filterDates.length && (
          <div className="card load-more" onClick={handleLoadMore}>
            <h3>...</h3>
          </div>
        )}
      </div>
      {renderTimeSlots()}
      {renderFinalID()}
    </div>
  );
}

export default App;
