const Home = () => {
  return (
    <>
      <title>Microtonal Lab</title>
      <h2>What is Microtonal Lab?</h2>
      <p>
        Microtonal Lab is an ongoing project by{" "}
        <a href="https://aleksuuu.github.io">Alexander Wu</a>. You can use it to
        generate microtonal ear-training exercises, somewhat similar to{" "}
        <a href="https://www.teoria.com/en/exercises/">teoría</a>. You can view
        the source code{" "}
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
      </ul>
      <h2></h2>
    </>
  );
};

export default Home;
