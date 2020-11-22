from setuptools import setup


with open('requirements.txt') as requirements:
    all_reqs = requirements.read().split('\n')

setup(
    name='YMPlayer',
    version='0.1.0',
    description='Music player that uses Youtube as a source of content',
    long_description_content_type='text/markdown',
    author='MaXshTT',
    license='MIT',
    packages=['ymplayer'],
    package_data={'ymplayer': ['web/*',
                               'web/js/*', 'web/css/*', 'web/img/*']},
    include_package_data=True,
    install_requires=[x.strip() for x in all_reqs if ('git+' not in x) and (
        not x.startswith('#')) and (not x.startswith('-'))],
    python_requires='>=3.6',
    entry_points={
        'console_scripts': [
            'ymplayer=ymplayer.__main__:main',
        ],
    },
    classifieres=[
        'Development Status :: 3 - Alpha',
        'Natural Language :: English'
        'Operating System :: MacOS',
        'Operating System :: POSIX :: Linux',
        'Operating System :: Microsoft :: Windows :: Windows 10',
        'Programming Language :: Python :: 3',
        'Programming Language :: Python :: 3.6',
        'Programming Language :: Python :: 3.7',
        'Programming Language :: Python :: 3.8',
        'Programming Language :: JavaScript',
        'Topic :: Multimedia :: Sound/Audio',
        'Topic :: Internet :: WWW/HTTP"]',
        'License :: OSI Approved :: MIT License',
    ],
)
