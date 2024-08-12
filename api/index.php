<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Fix imgur link</title>
  <link rel="shortcut icon" type="image/x-icon" href="../images/DALL·E-2024-08-13-02.50.37.ico" />
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH" crossorigin="anonymous">
  <link rel="stylesheet" href="../css/style.css">
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js" integrity="sha384-YvpcrYf0tY3lHB60NNkmXc5s9fDVZLESaAA55NDzOxhy9GkcIdslK1eN7N6jIeHz" crossorigin="anonymous"></script>
  <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
  <!-- Toastr CSS -->
  <link href="https://cdnjs.cloudflare.com/ajax/libs/toastr.js/latest/toastr.min.css" rel="stylesheet" />
  <!-- Toastr JS -->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/toastr.js/latest/toastr.min.js"></script>
  <script async src="//s.imgur.com/min/embed.js" charset="utf-8"></script>
</head>

<body>
  <h1>Fix Imgur Link</h1>
  <h2>Fix Imgur Link</h2>
  <div>
    <div class="wrapper">
      <h3>What does this do?</h3>
      <div class="what_it_does">
        <h4>- Transform your links into a standard pattern.</h4>
        <h4>- Mass download.</h4>
        <h4>- Recover gifs that are hidden by Imgur.</h4>
      </div>
      <div class="separator">
      </div>
      <div class="form_wrapper">
        <form id="imgurForm">
          <label class="form-label">Input your Imgur links here:</label>
          <label class="form-label">For example: <i>https://i.imgur.com/FCwNSbY.mp4</i></label>
          <label class="form-label">Or: <i>https://imgur.com/FCwNSbY</i></label>
          <textarea id="imgurUrls" name="imgurUrls" required></textarea>
          <label class="form-label author">Made by <i> JN0106</i></label>
          <div class="button">
            <button type="submit" class="btn btn-primary">Execute</button>
          </div>
        </form>
      </div>
      <div id="resultWrapper" style="display: none;">
        <h3>Output links:</h3>
        <div class="form_wrapper">
          <label for="output" class="form-label">After removing prefix i and postfix .mp4 for a standard link:</label>
          <textarea id="result" readonly></textarea>
        </div>
        <br>
        <div class="button">
          <button id="downloadBtn" class="btn btn-success">Download All Videos</button>
        </div>
        <br>
        <div id="videoContainer"></div> <!-- Container for videos -->
      </div>
    </div>
  </div>

  <script src="../js/main.js"></script>
</body>

</html>