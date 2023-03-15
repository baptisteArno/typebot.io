<div style="padding: 1rem; max-width: 700px">
  <h1 style="margin-bottom: 2rem;">Typebot Settings</h1>
  <ol style="margin-top: 1rem; margin-left: 1rem; font-size: 16px; display: flex; flex-direction: column;gap: 1rem">
    <li>Generate your initialization snippet in the Share tab of your typebot.</li>
    <li>If embedding as <strong>Standard</strong> container, paste the generated shortcode anywhere on your site.</li>
    <li>
      <form method="post" action="options.php">
        <?php
        settings_fields('typebot');
        do_settings_sections('typebot');
        ?>
        <div style="display: flex; flex-direction: column">
          <label>If embedding as <strong>Popup</strong> or <strong>Bubble</strong>, paste the initialization snippet here:</label>
          <textarea name="init_snippet" style="min-height: 150px; padding: 0.5rem; margin-top: 1rem"><?php echo esc_attr(get_option('init_snippet')); ?></textarea>
        </div>

        <div style="display: flex; flex-direction: column; margin-top: 1rem">
          <label>Excluded pages (optionnal):</label>
          <p style="color: gray">Example: /app/*, /user/*, /admin/settings</p>
          <input name="excluded_pages" value="<?php echo esc_attr(get_option('excluded_pages')); ?>" style="padding: .5rem" />
        </div>

        <div style="margin-top: 1rem">
          <div>
            <button class="button">Save</button>
          </div>
        </div>
      </form>
    </li>
  </ol>
</div>