const Home = () => {
  return (
    <>
      <title>Microtonal Lab</title>
      <h2>What is Microtonal Lab?</h2>
      <p>
        Microtonal Lab is an ongoing project by{" "}
        <a href="https://aleksuuu.github.io">Alexander Wu</a>. You can use it to{" "}
        <a href="/microtonal-lab/interval">generate</a> microtonal ear-training
        exercises, <a href="/microtonal-lab/freq-to-midi">send</a> microtonal
        MIDI messages, and do some microtonal/partial-related{" "}
        <a href="/microtonal-lab/utility-tools">math</a>. You can view the
        source code{" "}
        <a href="https://github.com/aleksuuu/microtonal-lab">here</a>. PRs
        welcome!
      </p>
      <h2>Current available features</h2>
      <ul>
        <li>- Generate intervals in 12, 19, 24, or 31edo</li>
        <li>- Select from 4 playback sounds</li>
        <li>
          - Enter up to 8 frequencies and convert them to MPE MIDI note messages
          (with pitchbend messages)
        </li>
        <li>- Pitch converter (in Utility Tools)</li>
      </ul>
      <h2></h2>
    </>
  );
};

export default Home;
