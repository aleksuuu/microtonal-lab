const Home = () => {
  return (
    <>
      <title>Microtonal Lab</title>
      <h2>What is Microtonal Lab?</h2>
      <p>
        Microtonal Lab is an ongoing project by{" "}
        <a href="https://aleksuuu.github.io">Alexander Wu</a>. You can view the
        source code{" "}
        <a href="https://github.com/aleksuuu/microtonal-lab">here</a>. PRs
        welcome!
      </p>
      <h2>Current available features</h2>
      <ul>
        <li>
          - <a href="/microtonal-lab/interval">Interval</a>: Generate intervals
          in 12, 19, 24, or 31edo, select from 4 playback sounds (TODO: JI
          intervals).
        </li>
        <li>
          - <a href="/microtonal-lab/freq-to-midi">Frequency to MIDI</a>: Enter
          up to 8 frequencies and convert them to MPE MIDI note messages (with
          pitchbend messages)
        </li>
        <li>
          - <a href="/microtonal-lab/utility-tools">Utility Tools</a>: Convert
          between different pitch units, find partials and imaginary
          fundamentals.
        </li>
        <li>
          - <a href="/microtonal-lab/tuner">Tuner</a>: Frequency tuner (TODO:
          Tune to a .scl scale).
        </li>
        <li>
          - <a href="/microtonal-lab/scala-editor">Scala Editor</a>: Edit or
          create{" "}
          <a href="https://www.huygens-fokker.org/scala/scl_format.html">
            Scala
          </a>{" "}
          files.
        </li>
      </ul>
      <h2></h2>
    </>
  );
};

export default Home;
