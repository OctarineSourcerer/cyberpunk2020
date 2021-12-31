export class LifepathUtils {


  /**
   * Binds the events associated with lifepath on the actor sheet. 
   * This is mostly for the add/remove/editing
   * of siblings and life events as these are array objects that
   * handlebar/foundryvtt doesn't have great APIs for.
   *
   * @static
   * @param {*} html - html that need to find the element and bind event to.
   * @param {*} actor - actor object to get and update the data to.
   * @memberof LifepathUtils
   */
  static bindHTMLEvents(html, actor) {

    // life events
    html.find('.add-life-event').click(ev => {
      ev.stopPropagation();
      let events = actor.data.data.lifepath.lifeEvents;
      if (!events) {
        events = [];
      }
      let currYear = 17; // set to the default to age starting at 18 years old
      if (events.length > 0) {
        // get the last event year
        currYear = events[events.length - 1].year;
      }
      currYear++;
      events.push({ year: currYear, description: '' });
      actor.update({ 'data.lifepath.lifeEvents': events });
    });

    html.find('.lifepath-life-events .update-year').change(ev => {
      ev.stopPropagation();
      const index = ev.currentTarget.dataset.index;
      const val = Number(ev.currentTarget.value);      
      if (!isNaN(val)){
        let events = actor.data.data.lifepath.lifeEvents;
        events[index].year = val;
        events.sort((a,b)=> ((a.year > b.year) ? 1 : ((a.year < b.year) ? -1 : 0)));
        actor.update({ 'data.lifepath.lifeEvents': events });
      }
    });

    html.find('.lifepath-life-events .remove-year').click(ev => {
      ev.stopPropagation();
      const index = ev.currentTarget.dataset.index;
      let events = actor.data.data.lifepath.lifeEvents;
      events.splice(index, 1);
      actor.update({ 'data.lifepath.lifeEvents': events });
    });

    html.find('.lifepath-life-events .lp-event-desc').change(ev => {
      ev.stopPropagation();
      const index = ev.currentTarget.dataset.index;
      const val = ev.currentTarget.value;
      let events = actor.data.data.lifepath.lifeEvents;
      // need to trim and replace newlines with spaces as foundry, for whatever reason, was
      // adding several spaces each time a newline was add or when the field was updated.
      const reg = /\s+/g;
      events[index].description = val.trim().replace('\n', ' ').replace(reg, ' ');
      actor.update({ 'data.lifepath.lifeEvents': events });
    });

    // Family section
    html.find('.add-sibling').click(ev => {
      ev.stopPropagation();
      let siblings = actor.data.data.lifepath.familyBackground.siblings;
      if (!siblings) {
        siblings = [];
      }
      siblings.push(
        { name: '', age: '', gender: '', feels: '' }
      );
      actor.update({ 'data.lifepath.familyBackground.siblings': siblings });
    });

    html.find('.remove-sibling').click(ev => {
      ev.stopPropagation();
      const index = ev.currentTarget.dataset.index;
      let siblings = actor.data.data.lifepath.familyBackground.siblings;
      siblings.splice(index, 1);
      actor.update({ 'data.lifepath.familyBackground.siblings': siblings });
    });

    // need a listener on each of the sibling's elements to update them as 
    // handlebar/foundryvtt doesn't play nice with arrays updates.
    html.find('.sibling-edit-input').change(ev => {
      ev.stopPropagation();
      const index = ev.currentTarget.dataset.index;
      const val = ev.currentTarget.value;
      const prop = ev.currentTarget.dataset.property;
      let siblings = actor.data.data.lifepath.familyBackground.siblings;
      siblings[index][prop] = val;
      actor.update({ 'data.lifepath.familyBackground.siblings': siblings });
    });


  }
}