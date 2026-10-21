// Tok Plan satis sayfasi + anket (/en/plan). HTML sunucuda, akis /tokplan.js ile tarayicida.
// Ust kisim arama motoru ve ilk gelen icin giris sayfasi; "Build my plan" anketi acar.
// Plan hesabi ve kapi /api/plan'da; bu sayfa yalnizca sonucu gosterir.

const CSS = `
.tp-hero h1{font-family:'Bricolage Grotesque',sans-serif;font-weight:800;font-size:38px;line-height:1.05;color:var(--forest);margin:8px 0 12px}
.tp-hero p.alt{font-size:18px;color:var(--muted);margin:0 0 18px}
.tp-mad{list-style:none;padding:0;margin:0 0 20px}.tp-mad li{padding:6px 0 6px 28px;position:relative}.tp-mad li:before{content:'';position:absolute;left:4px;top:13px;width:12px;height:12px;border-radius:50%;background:var(--lime);box-shadow:0 0 0 3px var(--forest)}
.tp-cta{display:block;width:100%;border:0;background:var(--forest);color:var(--lime);font:600 18px Figtree,system-ui,sans-serif;padding:16px;border-radius:999px;cursor:pointer;text-align:center;text-decoration:none}
.tp-cta[disabled]{opacity:.6;cursor:wait}
.tp-not{text-align:center;color:var(--muted);font-size:14px;margin:8px 0 0}
.tp-kutu{background:var(--card);border-radius:22px;padding:20px;margin:16px 0;box-shadow:0 1px 2px rgba(14,34,23,.05),0 10px 24px -14px rgba(14,34,23,.2)}
.tp-kutu h2{font-family:'Bricolage Grotesque',sans-serif;font-size:22px;margin:0 0 10px;color:var(--forest)}
.tp-adim{display:grid;grid-template-columns:36px 1fr;gap:10px;margin:10px 0}.tp-adim b{width:32px;height:32px;border-radius:50%;background:var(--lime);color:var(--forest);display:flex;align-items:center;justify-content:center;font-family:'Bricolage Grotesque',sans-serif}
details.tp-sss{border-bottom:1px solid var(--line);padding:10px 0}details.tp-sss summary{cursor:pointer;font-weight:600}
#tp-anket[hidden],#tp-giris[hidden],#tp-sonuc[hidden],#tp-plan[hidden]{display:none}
.tp-ilerle{height:6px;background:var(--line);border-radius:3px;margin:6px 0 4px}.tp-ilerle i{display:block;height:6px;background:var(--teal);border-radius:3px;transition:width .25s}
.tp-ust{display:flex;justify-content:space-between;align-items:center;color:var(--muted);font-size:14px}
.tp-ust button{background:none;border:0;color:var(--teal);font:inherit;cursor:pointer;padding:6px 0}
.tp-soru{font-family:'Bricolage Grotesque',sans-serif;font-weight:800;font-size:26px;line-height:1.15;color:var(--forest);margin:14px 0 6px}
.tp-acik{color:var(--muted);margin:0 0 14px}
.tp-sec{display:flex;justify-content:space-between;align-items:center;width:100%;text-align:left;background:var(--card);border:1.5px solid var(--line);border-radius:16px;padding:14px 16px;margin:8px 0;font:inherit;color:var(--ink);cursor:pointer}
.tp-sec small{display:block;color:var(--muted);font-size:14px}
.tp-sec.on{border-color:var(--teal);box-shadow:0 0 0 2px var(--teal) inset}
.tp-cips{display:flex;flex-wrap:wrap;gap:8px;margin:8px 0 14px}.tp-cips button{background:var(--card);border:1.5px solid var(--line);border-radius:999px;padding:8px 14px;font:inherit;font-size:15px;cursor:pointer;color:var(--ink)}.tp-cips button.on{border-color:var(--teal);background:#E3F1E7}
.tp-alan{display:flex;gap:10px;align-items:center;margin:10px 0}
.tp-alan input,.tp-alan select{flex:1;font:inherit;font-size:20px;padding:12px 14px;border-radius:14px;border:1.5px solid var(--line);background:var(--card);color:var(--ink);min-width:0}
.tp-alan span{color:var(--muted);min-width:28px}
.tp-birim{display:inline-flex;background:var(--card);border-radius:999px;padding:3px;margin:4px 0 6px}.tp-birim button{border:0;background:none;padding:6px 14px;border-radius:999px;font:inherit;font-size:14px;cursor:pointer;color:var(--muted)}.tp-birim button.on{background:var(--forest);color:var(--lime)}
.tp-hata{color:#B3261E;font-size:14px;min-height:20px;margin:6px 0}
.tp-onay{display:flex;gap:10px;align-items:flex-start;font-size:14px;color:var(--muted);margin:12px 0}.tp-onay input{width:20px;height:20px;margin-top:2px;accent-color:#1F5C3B}
.tp-hedefler{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:12px 0}.tp-hedefler div{background:var(--paper);border-radius:14px;padding:10px;text-align:center}.tp-hedefler b{display:block;font-family:'Bricolage Grotesque',sans-serif;font-size:22px;color:var(--forest)}.tp-hedefler span{font-size:13px;color:var(--muted)}
.tp-zaman{margin:10px 0 4px}.tp-zaman .sat{display:grid;grid-template-columns:88px 1fr;gap:8px;align-items:center;margin:8px 0;font-size:13px;color:var(--muted)}
.tp-zaman .ray{position:relative;height:22px;background:var(--paper);border-radius:8px;overflow:hidden}
.tp-zaman .ray i{position:absolute;top:0;bottom:0;border-radius:6px}
.tp-zaman .tok{background:#2F8F5B}.tp-zaman .tipik{background:#9FB3A6}.tp-zaman .ac{background:repeating-linear-gradient(45deg,#E9A79F 0 6px,#F6D3CE 6px 12px)}
.tp-eksen{display:flex;justify-content:space-between;font-size:12px;color:var(--muted);padding-left:96px}
.tp-kilit{position:relative;border-radius:16px;overflow:hidden;margin:12px 0}.tp-kilit .bulanik{filter:blur(4px);pointer-events:none;user-select:none}.tp-kilit .ust{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-weight:600;color:var(--forest);background:rgba(230,239,232,.35)}
.tp-ogun{display:grid;grid-template-columns:76px 1fr;gap:10px;padding:12px 0;border-bottom:1px solid var(--line)}
.tp-ogun .saat{font-family:'Bricolage Grotesque',sans-serif;font-weight:800;color:var(--forest);font-size:17px;white-space:nowrap}.tp-ogun .saat small{display:block;font-family:Figtree,sans-serif;font-weight:400;font-size:12px;color:var(--muted)}
.tp-parca{display:flex;gap:10px;align-items:center;margin:6px 0}.tp-parca img,.tp-parca .bos{width:56px;height:42px;border-radius:10px;object-fit:cover;background:var(--paper);flex:0 0 auto}
.tp-parca .ad{font-weight:600;line-height:1.25}.tp-parca .ad small{display:block;font-weight:400;color:var(--muted);font-size:13px}
.tp-ogun .alt{display:flex;justify-content:space-between;align-items:center;font-size:13px;color:var(--muted);margin-top:4px}.tp-ogun .alt button{background:none;border:1px solid var(--line);border-radius:999px;padding:4px 10px;font:inherit;font-size:13px;cursor:pointer;color:var(--teal)}
.tp-gunler{display:flex;gap:6px;overflow-x:auto;margin:6px 0 4px;padding-bottom:4px}.tp-gunler button{flex:0 0 auto;border:1.5px solid var(--line);background:var(--card);border-radius:999px;padding:8px 14px;font:inherit;font-size:14px;cursor:pointer;color:var(--ink)}.tp-gunler button.on{background:var(--forest);color:var(--lime);border-color:var(--forest)}
.tp-toplam{display:flex;justify-content:space-between;font-size:14px;color:var(--muted);padding-top:10px}
`;

function govde() {
  return `
<section id="tp-giris" class="tp-hero">
  <h1>A meal plan built around staying full</h1>
  <p class="alt">Tell us how your day runs. We build a week of meals timed so each one carries you to the next, picked from 760 foods ranked by how long they keep you full.</p>
  <ul class="tp-mad">
    <li>Calorie and protein targets for every meal, not just the day</li>
    <li>Meal times matched to when you wake up and go to bed</li>
    <li>Vegan, vegetarian and allergy filters</li>
    <li>A new plan every week, with two swaps for every meal</li>
  </ul>
  <button class="tp-cta" type="button" data-basla>Build my plan</button>
  <p class="tp-not">Your daily targets are free. The full plan is $5/month, cancel anytime.</p>

  <div class="tp-kutu">
    <h2>How it works</h2>
    <div class="tp-adim"><b>1</b><div>Answer 10 short questions: your goal, body, schedule, diet and what you usually eat for breakfast.</div></div>
    <div class="tp-adim"><b>2</b><div>See your daily calories and protein, and how long your current breakfast actually keeps you full.</div></div>
    <div class="tp-adim"><b>3</b><div>Unlock a 7-day plan: what to eat, how much and when, with the hours each meal keeps you full.</div></div>
  </div>

  <div class="tp-kutu">
    <h2>Questions</h2>
    <details class="tp-sss"><summary>How do you know how long a meal keeps me full?</summary><p>Every food on PlateRank has a fullness score built from its protein, fiber, fat, sugar and calories. A meal's hours come from its total calories and that score. It's an estimate, not a measurement. <a href="/en/method">Read the method</a>.</p></details>
    <details class="tp-sss"><summary>Is this medical advice?</summary><p>No. Plans are for generally healthy adults. If you're under 18, pregnant or breastfeeding, have a chronic condition or take regular medication, talk to your doctor first. The plan builder won't create a plan in those cases.</p></details>
    <details class="tp-sss"><summary>What if I don't like a meal?</summary><p>Every meal comes with two swaps that hit the same calories and protein.</p></details>
    <details class="tp-sss"><summary>Can I cancel?</summary><p>Anytime, from the link in your payment email. Your first payment is refundable within 14 days. <a href="/en/refund">Refund policy</a>.</p></details>
  </div>
  <p class="tp-not"><a href="/en/terms">Terms</a> · <a href="/en/privacy">Privacy</a> · <a href="/en/refund">Refunds</a></p>
</section>

<section id="tp-anket" hidden aria-live="polite"></section>
<section id="tp-sonuc" hidden aria-live="polite"></section>
<section id="tp-plan" hidden aria-live="polite"></section>
<script src="/tokplan.js" defer></script>`;
}

function tokPlanSayfasi() {
  return {
    baslik: 'Stay Full Plan: a weekly meal plan that keeps you full | PlateRank',
    aciklama: 'A personalized weekly meal plan with calorie and protein targets for every meal, timed to your day so each meal keeps you full until the next. Free daily targets, full plan $5/month.',
    kanonik: 'https://platerank.dev/en/plan',
    css: CSS,
    govde: govde(),
  };
}

module.exports = { tokPlanSayfasi };
