<script>
  let isContainer, isPopup, isBubble, popupParamsElement, bubbleParamsElement, showAdvanced;
  window.addEventListener("load", function(event) {
    isContainer = document.getElementById("radio-container").checked
    isPopup = document.getElementById("radio-popup").checked
    isBubble = document.getElementById("radio-bubble").checked

    popupParamsElement = document.getElementById("popup-params")
    bubbleParamsElement = document.getElementById("bubble-params")

    if (isPopup) popupParamsElement.style.display = "block"
    if (isBubble) bubbleParamsElement.style.display = "block"
  });

  const updateParams = (type) => {
    popupParamsElement.style.display = "none"
    bubbleParamsElement.style.display = "none"

    if (type === "popup") popupParamsElement.style.display = "block"
    if (type === "bubble") bubbleParamsElement.style.display = "block"
  }

  const onRadioClick = (e) => updateParams(e.target.value)


  var currentValue;
  function handleClick(myRadio) {
    const easyBlock = document.getElementById("easy-block")
    const codeBlock = document.getElementById("code-block")
    currentValue = myRadio.value;
    if(currentValue === "easy"){
      easyBlock.style.display = "block" 
      codeBlock.style.display = "none" 
    } else if(currentValue === "advanced"){
      easyBlock.style.display = "none" 
      codeBlock.style.display = "block" 
    }      
  }

</script>
<div class="box" style="padding: 3rem; margin-top: 1rem; margin-right: 1rem; max-width: 800px">
  <h1 class="title">Typebot Settings</h1>
  <a style="text-decoration: underline" href="https://app.typebot.io/typebots" target="_blank">First, you need to create a Typebot with our builder. It's free.</a>
  <form method="post" action="options.php" style="margin-top: 1rem">
    <?php
    settings_fields('typebot');
    do_settings_sections('typebot');
    ?>
      <div style="display: flex; flex-direction: column;">
        <label>
          <input type="radio" name="config_type" onclick="handleClick(this);" value="easy" <?php if (
            esc_attr(get_option('config_type')) == 'easy'
          ) {
            echo esc_attr('checked');
          } ?>>
          Easy setup
        </label>
        <div id="easy-block" style="display: <?php if (
          esc_attr(get_option('config_type')) == 'easy'
        ) {
          echo esc_attr('block');
        } else {
          echo esc_attr('none');
        } ?>; margin-top:0.5rem">
          <div class="field">
            <label class="label">Your typebot URL</label>
            <div class="control">
              <input class="input" type="url" placeholder="Found in 'Share' page of your typebot" name="url" value="<?php echo esc_attr(
                get_option('url')
              ); ?>">
            </div>
          </div>
          <label class="label">Select an embed type</label>
          <div class="field is-grouped">
            <label class="box is-flex-direction-column" style="margin-bottom: 0; margin-right: 1rem; padding: 3rem">
              <svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="100" height="100" rx="5" fill="#0042DA" />
                <rect x="10" y="28" width="80" height="42" rx="6" fill="#FF8E20" />
                <circle cx="18" cy="37" r="5" fill="white" />
                <rect x="24" y="33" width="45" height="8" rx="4" fill="white" />
                <circle cx="18" cy="61" r="5" fill="white" />
                <rect x="24" y="57" width="45" height="8" rx="4" fill="white" />
                <rect x="31" y="45" width="45" height="8" rx="4" fill="white" />
                <circle cx="82" cy="49" r="5" fill="white" />
                <rect x="10" y="9" width="80" height="1" rx="0.5" fill="white" />
                <rect x="10" y="14" width="80" height="1" rx="0.5" fill="white" />
                <rect x="10" y="19" width="80" height="1" rx="0.5" fill="white" />
                <rect x="10" y="80" width="80" height="1" rx="0.5" fill="white" />
                <rect x="10" y="85" width="80" height="1" rx="0.5" fill="white" />
                <rect x="10" y="90" width="80" height="1" rx="0.5" fill="white" />
              </svg>
              <p style="text-align: center; font-size: 20px; margin-bottom: .5rem">Container</p>
              <input type="radio" onclick="onRadioClick(event)" name="embed_type" id="radio-container" style="display:flex; margin:auto" <?php if (
                esc_attr(get_option('embed_type')) === 'container'
              ) {
                echo esc_attr('checked');
              } ?> value="container">
            </label>
            <label class="box is-flex-direction-column" style="margin-bottom: 0; margin-right: 1rem; padding: 3rem">
              <svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="100" height="100" rx="5" fill="#0042DA" />
                <rect x="19" y="20" width="63" height="63" rx="6" fill="#FF8E20" />
                <circle cx="25.7719" cy="33.7719" r="3.77193" fill="white" />
                <rect x="31" y="30" width="27" height="8" rx="4" fill="white" />
                <circle r="3.77193" transform="matrix(-1 0 0 1 75.2281 43.7719)" fill="white" />
                <rect width="22" height="8" rx="4" transform="matrix(-1 0 0 1 70 40)" fill="white" />
                <rect x="31.0527" y="52" width="26.9473" height="7.54386" rx="3.77193" fill="white" />
                <circle cx="25.7719" cy="67.7719" r="3.77193" fill="white" />
                <rect x="31" y="64" width="27" height="8" rx="4" fill="white" />
              </svg>
              <p style="text-align: center; font-size: 20px; margin-bottom: .5rem">Popup</p>
              <input type="radio" onclick="onRadioClick(event)" name="embed_type" id="radio-popup" style="display:flex; margin:auto" <?php if (
                esc_attr(get_option('embed_type')) === 'popup'
              ) {
                echo esc_attr('checked');
              } ?> value="popup">
            </label>
            <label class="box is-flex-direction-column" style="margin-bottom: 0; padding: 3rem">
              <svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="100" height="100" rx="5" fill="#0042DA" />
                <circle cx="85.5" cy="85.5" r="7.5" fill="#FF8E20" />
              </svg>
              <p style="text-align: center; font-size: 20px; margin-bottom: .5rem">Bubble</p>
              <input type="radio" onclick="onRadioClick(event)" name="embed_type" id="radio-bubble" style="display:flex; margin:auto" <?php if (
                esc_attr(get_option('embed_type')) === 'bubble'
              ) {
                echo esc_attr('checked');
              } ?> value="bubble">
            </label>
          </div>

          <div style="margin-top: 2rem; display:none" id="popup-params">
            <div class="field">
              <label class="label">Delay before apparition in seconds</label>
              <div class="control" style="margin-bottom: 1rem;">
                <input class="input" type="number" placeholder="0" name="popup_delay" value="<?php echo esc_attr(
                  get_option('popup_delay')
                ); ?>">
              </div>
            </div>
            <div class="field">
              <label class="label">Pages to include separated by a comma (optionnal)</label>
              <div class="control" style="margin-bottom: 1rem;">
                <input class="input" type="text" placeholder="/my-page/*,/my-other-page" name="popup_included_pages" value="<?php echo esc_attr(
                  get_option('popup_included_pages')
                ); ?>">
              </div>
            </div>
          </div>



          <div style="margin-top: 2rem; display:none" id="bubble-params">
            <div class="field">
              <label class="label">Bubble button color</label>
              <div class="control">
                <input class="input" type="text" placeholder="#0042DA" name="button_color" value="<?php echo esc_attr(
                  get_option('button_color')
                ); ?>">
              </div>
            </div>
            <div class="field">
              <label class="label">Auto open delay (optional)</label>
              <div class="control">
                <input class="input" type="number" placeholder="Delay before the chat opens up (5)" name="chat_delay" value="<?php echo esc_attr(
                  get_option('chat_delay')
                ); ?>">
              </div>
            </div>
            <div class="field">
              <label class="label">Bubble button icon (optional)</label>
              <div class="control">
                <input class="input" type="text" placeholder="Type an image URL..." name="chat_icon" value="<?php echo esc_attr(
                  get_option('chat_icon')
                ); ?>">
              </div>
            </div>
            <div class="field">
              <label class="label">Proactive message (optional)</label>
              <div class="control">
                <input class="input" type="text" placeholder="Message (Hey, I have some questions for you 👋)" name="text_content" value="<?php echo esc_attr(
                  get_option('text_content')
                ); ?>">
              </div>
              <div class="control" style="margin-top: .5rem">
                <input class="input" type="text" placeholder="Avatar photo URL (https://...)" name="avatar" value="<?php echo esc_attr(
                  get_option('avatar')
                ); ?>">
              </div>
              <div class="control" style="margin-top: .5rem; margin-bottom: 1rem">
                <input class="input" type="number" placeholder="Delay before message apparition (5)" name="bubble_delay" value="<?php echo esc_attr(
                  get_option('bubble_delay')
                ); ?>">
              </div>
              <label>
                <input type="checkbox" <?php if (
                  esc_attr(get_option('dont_show_callout_twice'))
                ) {
                  echo esc_attr('checked');
                } ?> name="dont_show_callout_twice">
                Don't show callout message when opened or closed once
              </label>
            </div>
            <div class="field">
              <label class="label">Pages to include separated by a comma (optionnal)</label>
              <div class="control" style="margin-bottom: 1rem;">
                <input class="input" type="text" placeholder="/my-page/*,/my-other-page" name="chat_included_pages" value="<?php echo esc_attr(
                  get_option('chat_included_pages')
                ); ?>">
              </div>
            </div>
          </div>
          <?php if (esc_attr(get_option('embed_type')) === 'container'): ?>
          <div class="notification is-link" style="margin-bottom: 1rem;">
            You can now place your typebot container anywhere in your site using [typebot] shortcode.
            <br><br>
            Your page templating system probably has a "Shortcode" element (if not, use a text element) where you can paste:
            <pre>[typebot]</pre>
            <br>
            Optionnaly, you can adjust `width`, `height`, `background-color` and/or `url` if you want to embed multiple typebots:
            <pre>[typebot width="100%" height="500px" background-color="#F7F8FF" url="https://my.typebot.io"]</pre>
          </div>
        <?php endif; ?>
        </div>
        
        <label>
          <input type="radio" name="config_type" onclick="handleClick(this);" value="advanced" <?php if (
            esc_attr(get_option('config_type')) == 'advanced'
          ) {
            echo esc_attr('checked');
          } ?>>
          Advanced setup (with code)
        </label>
        <div id="code-block" style="display: <?php if (
          esc_attr(get_option('config_type')) == 'advanced'
        ) {
          echo esc_attr('block');
        } else {
          echo esc_attr('none');
        } ?>">
          <label>Paste the code from "HTML & Js" in Typebot in the Share tab:</label>
          <textarea class="textarea" style="margin-top:0.5rem" name="custom_code"><?php echo esc_attr(
            get_option('custom_code')
          ); ?></textarea>
        </div>

      </div> 

    <div class="field" style="margin-top: 2rem">
      <div class="control">
        <button class="button is-link is-medium">Save</button>
      </div>
    </div>
  </form>
</div>