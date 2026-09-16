cmake_minimum_required(VERSION 3.20)
project(3v0l_audio_bridge LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# Legacy per-process loopback listener.
add_executable(3v0l-process-listener src/main.cpp)
target_compile_definitions(3v0l-process-listener PRIVATE UNICODE _UNICODE NOMINMAX WIN32_LEAN_AND_MEAN)
target_link_libraries(3v0l-process-listener PRIVATE ole32 uuid avrt ws2_32 mmdevapi)

# Recommended interview mode: capture the Windows default speaker/render output.
# This captures playback (Discord/Meet/Teams/browser/etc.) without opening the microphone.
add_executable(3v0l-listener src/system_main.cpp)
target_compile_definitions(3v0l-listener PRIVATE UNICODE _UNICODE NOMINMAX WIN32_LEAN_AND_MEAN)
target_link_libraries(3v0l-listener PRIVATE ole32 uuid avrt ws2_32 mmdevapi)
