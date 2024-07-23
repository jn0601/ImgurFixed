<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Fix imgur link</title>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH" crossorigin="anonymous">
  <link rel="stylesheet" href="../css/style.css">
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js" integrity="sha384-YvpcrYf0tY3lHB60NNkmXc5s9fDVZLESaAA55NDzOxhy9GkcIdslK1eN7N6jIeHz" crossorigin="anonymous"></script>
  <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
  <script async src="//s.imgur.com/min/embed.js" charset="utf-8"></script>
</head>

<body>
  <div>
    <div class="wrapper">
      <h3>Input imgur links here:</h3>
      <div class="form_wrapper">
        <form id="imgurForm">
          <label for="input" class="form-label">For example: https://i.imgur.com/FCwNSbY.mp4</label>
          <textarea id="imgurUrls" name="imgurUrls" required></textarea>
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
          <!-- <button id="downloadWithIdmBtn" class="btn btn-success">Download All Videos With IDM</button> -->
        </div>
        <br>
        <div id="videoContainer"></div> <!-- Container for videos -->
      </div>
    </div>
  </div>

  <script src="../js/main.js"></script>
</body>

</html>