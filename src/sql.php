<?php
// Set headers for CORS and JSON content type
session_start();
include "connectDB.php";
$response = ['isLoggedIn' => false,'username' =>'', 'data' => []];
if (isset($_SESSION['user'])) {
  $response['isLoggedIn'] = true;
  $username = $_SESSION['user'];
  $response['username'] = $username ;
}else{
  echo json_encode($response);
  exit();
}

$Data = file_get_contents("php://input");
$Data = json_decode($Data, true);

$device_ids = $Data['device_id'];
$date = $Data['date'];
$time = $Data['time'];
$address = $Data['address'];
$unit = $Data['unit'];

if ($time == "year") {
  foreach ($device_ids as $device_id) {
    $sql = "WITH Years AS (
        SELECT 2015 AS year
        UNION SELECT 2016
        UNION SELECT 2017
        UNION SELECT 2018
        UNION SELECT 2019
        UNION SELECT 2020
        UNION SELECT 2021
        UNION SELECT 2022
        UNION SELECT 2023
        UNION SELECT 2024
    )

    SELECT
        Years.year AS date_sequence,
        COALESCE(SUM(device_event.value), 0) AS sum_value
    FROM
        Years
    LEFT OUTER JOIN
        device_event ON Years.year = YEAR(device_event.time_stamp) AND device_event.device_id = ?  AND device_event.event_label = 'energy use'
    GROUP BY
        Years.year
    ORDER BY
        Years.year;";

    // Prepare and execute the SQL statement
    $stmt = $mysqli->prepare($sql);
    $stmt->bind_param("i", $device_id);
    $stmt->execute();

    // Fetch the result
    $res = $stmt->get_result();
    $row = $res->fetch_all(MYSQLI_ASSOC);

    // Close the statement
    $stmt->close();

    // Store the result in the response array
    $response['data'][$device_id] = $row;
  }
  // If no devices selected, generate default yearly data
  $response['data']['0'] = array();
  $currentDate = new DateTime('2015-01-01');
  $endDate = new DateTime('2024-12-31');

  while ($currentDate <= $endDate) {
    $response['data']['0'][] = array(
      'date_sequence' => $currentDate->format('Y'),
      'sum_value' => 0
    );
    $currentDate->modify('+1 year');
  }

  $sql = "SELECT years.year as data_sequence, COALESCE(avg_tmp.avg_total, 0) as sum_value
FROM (
    SELECT 2015 as year UNION ALL
    SELECT 2016 UNION ALL
    SELECT 2017 UNION ALL
    SELECT 2018 UNION ALL
    SELECT 2019 UNION ALL
    SELECT 2020 UNION ALL
    SELECT 2021 UNION ALL
    SELECT 2022 UNION ALL
    SELECT 2023 UNION ALL
    SELECT 2024
) as years
LEFT JOIN (
    SELECT AVG(total) as avg_total, event_year
    FROM (
        SELECT SUM(de_other.value) as total, l_other.building_address, l_other.unit_number, YEAR(de_other.time_stamp) as event_year
        FROM Device_Event de_other
        JOIN Enrolled_Devices ed_other ON de_other.device_id = ed_other.device_id
        JOIN Locations l_other ON ed_other.building_address = l_other.building_address AND ed_other.unit_number = l_other.unit_number
        JOIN Locations l ON l.building_address = ? AND l.unit_number = ?
        WHERE ABS(l_other.square_feet - l.square_feet) <= 0.05 * l.square_feet
        AND de_other.event_label = 'energy use'
        GROUP BY l_other.building_address, l_other.unit_number, event_year
    ) as tmp
    GROUP BY event_year
) as avg_tmp ON years.year = avg_tmp.event_year;";
  $stmt = $mysqli->prepare($sql);
  $stmt->bind_param("ss", $address, $unit);
  $stmt->execute();
  $res = $stmt->get_result();
  $row = $res->fetch_all(MYSQLI_ASSOC);
  $stmt->close();
  $response['data']['avg'] = $row;
}
// Handle the case when time is not set to "year"
else if ($time === "month") {
  $sql = "SELECT
  CASE m.month
    WHEN 1 THEN 'Jan'
    WHEN 2 THEN 'Feb'
    WHEN 3 THEN 'Mar'
    WHEN 4 THEN 'Apr'
    WHEN 5 THEN 'May'
    WHEN 6 THEN 'Jun'
    WHEN 7 THEN 'Jul'
    WHEN 8 THEN 'Aug'
    WHEN 9 THEN 'Sep'
    WHEN 10 THEN 'Oct'
    WHEN 11 THEN 'Nov'
    WHEN 12 THEN 'Dec'
  END as date_sequence,
  COALESCE(SUM(de_other.value), 0) as sum_value
FROM (
  SELECT 1 AS month UNION ALL
  SELECT 2 UNION ALL
  SELECT 3 UNION ALL
  SELECT 4 UNION ALL
  SELECT 5 UNION ALL
  SELECT 6 UNION ALL
  SELECT 7 UNION ALL
  SELECT 8 UNION ALL
  SELECT 9 UNION ALL
  SELECT 10 UNION ALL
  SELECT 11 UNION ALL
  SELECT 12
) AS m
LEFT OUTER JOIN Device_Event de_other ON
  MONTH(de_other.time_stamp) = m.month
  AND YEAR(de_other.time_stamp) = ?
  AND de_other.device_id = ?
  AND de_other.event_label = 'energy use'
GROUP BY m.month
ORDER BY m.month;";
  foreach ($device_ids as $device_id) {
    $stmt = $mysqli->prepare($sql);
    $stmt->bind_param("si", $date, $device_id);
    $stmt->execute();
    $res = $stmt->get_result();
    $row = $res->fetch_all(MYSQLI_ASSOC);
    $stmt->close();
    $response['data'][$device_id] = $row;
  }
  $response['data']['0'] = array();
  $currentDate = new DateTime($date . "-01-01");
  $endDate = new DateTime($date . "-12-31");

  while ($currentDate <= $endDate) {
    $response['data']['0'][] = array(
      'date_sequence' => $currentDate->format('M'),
      'sum_value' => 0
    );
    $currentDate->modify('+1 month');
  }
  $sql = "SELECT
  CASE m.month
      WHEN 1 THEN 'Jan'
      WHEN 2 THEN 'Feb'
      WHEN 3 THEN 'Mar'
      WHEN 4 THEN 'Apr'
      WHEN 5 THEN 'May'
      WHEN 6 THEN 'Jun'
      WHEN 7 THEN 'Jul'
      WHEN 8 THEN 'Aug'
      WHEN 9 THEN 'Sep'
      WHEN 10 THEN 'Oct'
      WHEN 11 THEN 'Nov'
      WHEN 12 THEN 'Dec'
  END as date_sequence,
  COALESCE(SUM(de_other.value), 0) as sum_value
FROM (
  SELECT 1 AS month UNION ALL
  SELECT 2 UNION ALL
  SELECT 3 UNION ALL
  SELECT 4 UNION ALL
  SELECT 5 UNION ALL
  SELECT 6 UNION ALL
  SELECT 7 UNION ALL
  SELECT 8 UNION ALL
  SELECT 9 UNION ALL
  SELECT 10 UNION ALL
  SELECT 11 UNION ALL
  SELECT 12
) AS m
LEFT JOIN (
  SELECT AVG(value) as value, month
  FROM (
      SELECT SUM(de_other.value) as value, MONTH(de_other.time_stamp) as month, l_other.building_address, l_other.unit_number 
      FROM Device_Event de_other
      JOIN Enrolled_Devices ed_other ON de_other.device_id = ed_other.device_id
      JOIN Locations l_other ON ed_other.building_address = l_other.building_address AND ed_other.unit_number = l_other.unit_number
      JOIN Locations l ON l.building_address = ? AND l.unit_number = ?
      WHERE ABS(l_other.square_feet - l.square_feet) <= 0.05 * l.square_feet
      AND de_other.event_label = 'energy use' AND YEAR(de_other.time_stamp) = ?
      GROUP BY l_other.building_address, l_other.unit_number, MONTH(de_other.time_stamp)
  ) as tmp
  GROUP BY month
) AS de_other ON m.month = de_other.month
GROUP BY m.month
ORDER BY m.month;";
  $stmt = $mysqli->prepare($sql);
  $stmt->bind_param("sss", $address, $unit, $date);
  $stmt->execute();
  $res = $stmt->get_result();
  $row = $res->fetch_all(MYSQLI_ASSOC);
  $stmt->close();
  $response['data']['avg'] = $row;
} else if ($time === "day") {
  $sql = "WITH RECURSIVE DateSequence AS (
  SELECT 1 AS day
  UNION ALL
  SELECT day + 1
  FROM DateSequence
  WHERE day < DAY(LAST_DAY(?))
)
SELECT day as date_sequence, COALESCE(SUM(value), 0) as sum_value FROM DateSequence LEFT OUTER JOIN Device_Event ON
MONTH(time_stamp) = ?
AND YEAR(time_stamp) = ?
AND device_id = ?
AND event_label = 'energy use'
and day = day(time_stamp)
GROUP BY day
ORDER BY day;";
  $Date = new DateTime($date . "-01");
  $tmp = $date . "-01";
  $Month = $Date->format('m');
  $Year = $Date->format('Y');
  foreach ($device_ids as $device_id) {
    $stmt = $mysqli->prepare($sql);
    $stmt->bind_param("sssi", $tmp, $Month, $Year, $device_id);
    $stmt->execute();
    $res = $stmt->get_result();
    $row = $res->fetch_all(MYSQLI_ASSOC);
    $stmt->close();
    $response['data'][$device_id] = $row;
  }
  $response['data']['0'] = array();
  $currentDate = new DateTime($date . "-01");
  $endDate = new DateTime($date . "-01");
  $endDate->modify('+1 month');
  while ($currentDate < $endDate) {
    $response['data']['0'][] = array(
      'date_sequence' => $currentDate->format('d'),
      'sum_value' => 0
    );
    $currentDate->modify('+1 day');
  }
  $sql = "WITH RECURSIVE DateSequence AS (
  SELECT 1 AS day
  UNION ALL
  SELECT day + 1
  FROM DateSequence
  WHERE day < DAY(LAST_DAY(?))
)
SELECT ds.day AS date_sequence, COALESCE(AVG(total), 0) AS sum_value
FROM (
    SELECT SUM(de_other.value) AS total, l_other.building_address, l_other.unit_number, DAY(de_other.time_stamp) AS day
    FROM Device_Event de_other
    JOIN Enrolled_Devices ed_other ON de_other.device_id = ed_other.device_id
    JOIN Locations l_other ON ed_other.building_address = l_other.building_address AND ed_other.unit_number = l_other.unit_number
    JOIN Locations l ON l.building_address = ? AND l.unit_number = ?
    WHERE ABS(l_other.square_feet - l.square_feet) <= 0.05 * l.square_feet
      AND de_other.event_label = 'energy use'
      AND YEAR(de_other.time_stamp) = ?
      AND MONTH(de_other.time_stamp) = ?
    GROUP BY l_other.building_address, l_other.unit_number, day
) AS tmp
RIGHT JOIN DateSequence ds ON tmp.day = ds.day
GROUP BY ds.day
ORDER BY ds.day;
";
  $stmt = $mysqli->prepare($sql);
  $stmt->bind_param("sssss", $tmp, $address, $unit, $Year, $Month);
  $stmt->execute();
  $res = $stmt->get_result();
  $row = $res->fetch_all(MYSQLI_ASSOC);
  $stmt->close();
  $response['data']['avg'] = $row;
}

$mysqli->close();

echo json_encode($response);
?>