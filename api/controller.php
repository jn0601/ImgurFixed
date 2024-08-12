<?php
function transformImgurUrls($inputUrls) {
    // Split input by new lines and process each URL
    $urls = explode("\n", $inputUrls);
    $transformedUrls = array();

    // Regular expression to match the first pattern (e.g., https://i.imgur.com/abc.mp4)
    $pattern1 = '/^https?:\/\/i\.imgur\.com\/([a-zA-Z0-9]+)\.(mp4|gifv)$/';

    // Regular expression to match the second pattern (e.g., https://imgur.com/abc)
    $pattern2 = '/^https?:\/\/imgur\.com\/([a-zA-Z0-9]+)$/';

    // foreach ($urls as $url) {
    //     $url = trim($url); // Trim whitespace
    //     if (preg_match($pattern, $url, $matches)) {
    //         $transformedUrls[] = "https://imgur.com/" . $matches[1];
    //     } else {
    //         $transformedUrls[] = $url;
    //     }
    // }

    foreach ($urls as $url) {
        $url = trim($url); // Trim whitespace

        // Check if the URL matches the first pattern
        if (preg_match($pattern1, $url, $matches)) {
            $transformedUrls[] = "https://imgur.com/" . $matches[1];
        }
        // Check if the URL matches the second pattern
        elseif (preg_match($pattern2, $url, $matches)) {
            $transformedUrls[] = "https://imgur.com/" . $matches[1];
        }
        // Else, skip the URL if it doesn't match the pattern
    }

    // Join transformed URLs back into a string
    return implode("\n", $transformedUrls);
}

// Handle AJAX request
if (isset($_POST['imgurUrls'])) {
    $inputUrls = $_POST['imgurUrls'];
    $transformedUrls = transformImgurUrls($inputUrls);
    echo json_encode(['transformedUrls' => $transformedUrls]);
}
?>