<?php
function transformImgurUrls($inputUrls) {
    // Split input by new lines and process each URL
    $urls = explode("\n", $inputUrls);
    $transformedUrls = array();

    // Regular expression to match the pattern
    $pattern = '/^https?:\/\/i\.imgur\.com\/([a-zA-Z0-9]+)\.(mp4|gifv)$/';

    foreach ($urls as $url) {
        $url = trim($url); // Trim whitespace
        if (preg_match($pattern, $url, $matches)) {
            $transformedUrls[] = "https://imgur.com/" . $matches[1];
        } else {
            $transformedUrls[] = $url;
        }
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