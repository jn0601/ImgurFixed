<?php
function fetchImgurAlbumImages($albumId)
{
    $clientId = '5dc6065411ee2ab'; // Use your actual Imgur Client-ID
    $url = "https://api.imgur.com/3/album/$albumId";

    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
    curl_setopt($ch, CURLOPT_HTTPHEADER, array("Authorization: Client-ID $clientId"));

    // Ignore SSL for localhost
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);

    $response = curl_exec($ch);
    $statusCode = curl_getinfo($ch, CURLINFO_HTTP_CODE); // Get the status code
    curl_close($ch);

    if ($statusCode != 200) {
        return array(); // Return empty array if the request fails
    }

    $responseArray = json_decode($response, true);

    if (isset($responseArray['data']['images']) && is_array($responseArray['data']['images'])) {
        $images = array_map(function ($image) {
            return "https://imgur.com/" . $image['id'];
        }, $responseArray['data']['images']);
        return $images;
    }

    return array();
}

function checkUrlStatus($url)
{
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_NOBODY, true);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HEADER, true);
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, false); // Don't follow redirects to get accurate status code

    // Ignore SSL for localhost
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);

    curl_exec($ch);
    $statusCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    return $statusCode;
}

function transformImgurUrls($inputUrls)
{
    // Split input by new lines and process each URL
    $urls = explode("\n", $inputUrls);
    $transformedUrls = array();
    $errorUrls = array();

    // Regular expression to match the first pattern (e.g., https://i.imgur.com/abc.mp4)
    $pattern1 = '/^https?:\/\/i\.imgur\.com\/([a-zA-Z0-9]+)\.(mp4|gifv)$/';

    // Regular expression to match the second pattern (e.g., https://imgur.com/abc)
    $pattern2 = '/^https?:\/\/imgur\.com\/([a-zA-Z0-9]+)$/';

    // Regular expression to match the album pattern (e.g., https://imgur.com/a/abc)
    $pattern3 = '/^https?:\/\/imgur\.com\/a\/(?:[a-zA-Z0-9-]+-)?([a-zA-Z0-9]+)$/';

    // Regular expression to match the gallery pattern (e.g., https://imgur.com/gallery/abc)
    $pattern4 = '/^https?:\/\/imgur\.com\/gallery\/(?:[a-zA-Z0-9-]+-)?([a-zA-Z0-9]+)$/';

    foreach ($urls as $url) {
        $url = trim($url); // Trim whitespace

        // Skip empty strings
        if (empty($url)) {
            continue;
        }

        // Extract the code after the last hyphen or slash
        // explode: This function splits a string into an array using a specified delimiter.
        // [
        //     "https:",
        //     "",
        //     "imgur.com",
        //     "neo-haerin-pwUecWV"
        //   ]
        // end: This function moves the internal pointer of an array to its last element and returns the value of that element.
        $urlParts = explode('/', $url);
        $lastPart = end($urlParts); // $lastPart is neo-haerin-pwUecWV:

        // Check if the last part contains a hyphen
        if (strpos($lastPart, '-') !== false) {
            // Extract the code after the last hyphen
            // strrchr($lastPart, '-') returns -pwUecWV
            // substr('-pwUecWV', 1) returns pwUecWV
            // substr(..., 1) removes the hyphen from the beginning of this substring, 
            // leaving you with only the part of the string after the last hyphen.
            $lastPart = substr(strrchr($lastPart, '-'), 1);
        }

        // Construct the adjusted URL
        $baseUrl = preg_replace('/\/[^\/]+$/', '', $url); // Remove the last segment
        $adjustedUrl = $baseUrl . '/' . $lastPart;

        // Check if the adjusted URL matches the first pattern
        if (preg_match($pattern1, $adjustedUrl, $matches)) {
            // Check if the transformed URL is valid
            $statusCode = checkUrlStatus($adjustedUrl);
            if ($statusCode == 200) {
                $transformedUrls[] = "https://imgur.com/" . $matches[1];
            } else {
                $errorUrls[] = $url; // Add to error list if 403 or 404
                continue;
            }
        }
        // Check if the adjusted URL matches the second pattern
        elseif (preg_match($pattern2, $adjustedUrl, $matches)) {
            // Check if the transformed URL is valid
            $statusCode = checkUrlStatus($adjustedUrl);
            if ($statusCode == 200) {
                $transformedUrls[] = "https://imgur.com/" . $matches[1];
            } else {
                $errorUrls[] = $url; // Add to error list if 403 or 404
                continue;
            }
        }
        // Check if the adjusted URL matches the album pattern
        elseif (preg_match($pattern3, $adjustedUrl, $matches)) {
            // Check if the transformed URL is valid
            $statusCode = checkUrlStatus($adjustedUrl);
            if ($statusCode == 200) {
                $albumId = $matches[1];
                // Fetch album images using Imgur API
                $albumImages = fetchImgurAlbumImages($albumId);
                if ($albumImages) {
                    $transformedUrls = array_merge($transformedUrls, $albumImages);
                } else {
                    $errorUrls[] = $url;
                }
            } else {
                $errorUrls[] = $url;
            }
        }
        // Check if the adjusted URL matches the gallery pattern
        elseif (preg_match($pattern4, $adjustedUrl, $matches)) {
            // Check if the transformed URL is valid
            $statusCode = checkUrlStatus($adjustedUrl);
            if ($statusCode == 200) {
                $albumId = $matches[1];
                // Fetch album images using Imgur API
                $albumImages = fetchImgurAlbumImages($albumId);
                if ($albumImages) {
                    $transformedUrls = array_merge($transformedUrls, $albumImages);
                } else {
                    $errorUrls[] = $url;
                }
            } else {
                $errorUrls[] = $url;
            }
        } else {
            $errorUrls[] = $url; // Add non-matching URLs to error list
        }

        // Else, skip the URL if it doesn't match the pattern
    }

    // Join transformed URLs back into a string
    return [
        'transformedUrls' => $transformedUrls, // Array of URLs
        'errorUrls' => $errorUrls // Array of URLs
    ];
}

// Handle AJAX request
if (isset($_POST['imgurUrls'])) {
    $inputUrls = $_POST['imgurUrls'];
    $result = transformImgurUrls($inputUrls);
    echo json_encode($result);
}
